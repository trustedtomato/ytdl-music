const guessMetadata = require('guess-metadata')
const got = require('got')
const queryString = require('query-string')
const camelcase = require('camelcase')

class ArrayMap extends Map {
  push (key, ...values) {
    if (values.length === 0) return this
    if (!super.has(key)) {
      super.set(key, values)
    } else {
      const array = super.get(key)
      if (!Array.isArray(array)) {
        throw new Error('Value at the given key is not an array!')
      }
      super.get(key).push(...values)
    }
    return this
  }
}

const parseAttributes = (lines) => {
  const attributes = lines.filter(line => line.includes(':'))
  const attributeMap = new ArrayMap()
  for (const attribute of attributes) {
    const [, attributeName, attributeValue] = attribute.match(/^\s*(.*?)\s*:\s*(.*?)\s*$/)
    const attributeNames = attributeName.split(', ')
    const attributeValues = attributeValue.split(', ')
    for (const attributeName of attributeNames) {
      attributeMap.push(attributeName, ...attributeValues)
    }
  }
  return attributeMap
}

const reduce = (iterable, reducer, defaultValue) => {
  let accumulator = defaultValue
  for (const entry of iterable) {
    accumulator = reducer(accumulator, entry)
  }
  return accumulator
}

const mapToObject = (map) => reduce(map, (obj, [key, value]) => {
  obj[key] = value
  return obj
}, {})

module.exports = async id =>
  got(`https://www.youtube.com/get_video_info?html5=1&video_id=${id}&cpn=KMV1jbykhU_ted-d&eurl&el=detailpage&hl=en_US&lact=5344&c=WEB_REMIX&cver=0.1&cplayer=UNIPLAYER&itct=CCEQyCAYCCITCJe5scmB6OgCFdOi3godR_QFqzIDQkZhSNiLzY3ew9-T1AE%3D`)
    .then(response => response.body)
    .then(queryString.parse)
    .then(obj => obj.player_response)
    .then(JSON.parse)
    .then(({ videoDetails: { thumbnail: { thumbnails }, keywords, title: videoTitle, author, shortDescription } }) => {
      const metadata = new ArrayMap()

      if (shortDescription.startsWith('Provided to YouTube by ') && shortDescription.endsWith('Auto-generated by YouTube.')) {
        const [rawLabel, , titleAndArtist, , album, , copyrightNotice, , ...rawAttributes] = shortDescription.split('\n')
        const [title, artist] = titleAndArtist.split(' · ')
        const label = rawLabel.replace('Provided to YouTube by ', '')
        const attributes = parseAttributes(rawAttributes)
        metadata.set('title', title)
        metadata.set('artist', artist)
        metadata.set('album', album)
        metadata.set('copyrightNotice', copyrightNotice)
        metadata.set('label', label)
        for (const [attributeName, attributeValue] of attributes) {
          if (!metadata.has(attributeName)) {
            metadata.push(camelcase(attributeName.toLowerCase()), ...attributeValue)
          }
        }
      } else {
        const guessedMetadata = guessMetadata(videoTitle)
        let title = videoTitle
        let artist = author.replace(/- Topic$/, '')
        if (guessedMetadata.artist) {
          title = guessedMetadata.title
          artist = guessedMetadata.artist
        }

        metadata.set('title', title)
        metadata.set('artist', artist)
        metadata.set('album', title)
      }

      // Get largest square thumbnail
      const largestThumbnail = thumbnails.reduce(
        (previousThumbnail, thumbnail) =>
          previousThumbnail.width < thumbnail.width && thumbnail.width === thumbnail.height
            ? thumbnail
            : previousThumbnail,
        { width: 0 }
      )

      if (largestThumbnail.url) {
        metadata.set('albumArtUrl', largestThumbnail.url)
      }

      return mapToObject(metadata)
    })
