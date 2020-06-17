const got = require('got')
const context = require('./ytm-context')
const headers = require('./ytm-headers')

const params = '?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'
const baseUrl = 'https://music.youtube.com/youtubei/v1/'

const resultTypes = ['song', 'playlist', 'video', 'artist', 'album']

const search = async (query, filter = null) => {
  const filtered = !!filter
  if (filtered && !resultTypes.includes(filter)) {
    throw new Error('The value of the filter attribute can only be "song", "playlist", "video", "artist", "album" or something falsy.')
  }

  const json = {
    context,
    query
  }

  if (filtered) {
    const param1 = 'Eg-KAQwIA'
    const param3 = 'MABqChAEEAMQCRAFEAo%3D'
    const param2 =
      filter === 'video' ? 'BABGAAgACgA'
        : filter === 'album' ? 'BAAGAEgACgA'
          : filter === 'artist' ? 'BAAGAAgASgA'
            : filter === 'playlist' ? 'BAAGAAgACgB'
              : filter === 'song' ? 'RAAGAAgACgA'
                : ''

    json.params = param1 + param2 + param3
  }

  let { body: { contents } } = await got.post(baseUrl + 'search' + params, {
    headers,
    json,
    responseType: 'json'
  })

  if (contents.tabbedSearchResultsRenderer) {
    contents = contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer.content
  }

  contents = contents.sectionListRenderer.contents

  const results = []

  contents.forEach(({ musicShelfRenderer: { contents } }) => {
    contents.forEach(({ musicResponsiveListItemRenderer: x }) => {
      const data = {}

      if (x.navigationEndpoint) {
        data.browseId = x.navigationEndpoint.browseEndpoint.browseId
      } else {
        data.videoId = x.overlay.musicItemThumbnailOverlayRenderer.content.musicPlayButtonRenderer.playNavigationEndpoint.watchEndpoint.videoId
      }

      const textFields = x.flexColumns.map(column => column.musicResponsiveListItemFlexColumnRenderer.text.runs.map(run => run.text).join(' / '))
      let resultType = filtered ? filter : textFields[1].toLowerCase()
      if (!resultTypes.includes(resultType)) {
        // default to album since it's labeled with multiple values ('Single', 'EP', etc.)
        resultType = 'album'
      }

      if (resultType === 'album') {
        data.title = textFields[0]
        data.type = textFields[1].toLowerCase()
        data.artist = textFields[2]
        data.year = textFields[3]
      } else {
        data.type = resultType
      }

      if (resultType === 'artist') {
        data.name = textFields[0]
      }

      if (resultType === 'song') {
        data.title = textFields[0]
        data.artist = textFields[filtered ? 1 : 2]
        data.album = textFields[filtered ? 2 : 3]
        data.duration = textFields[filtered ? 3 : 4]
        data.albumArtUrl = x.thumbnail.musicThumbnailRenderer.thumbnail.thumbnails
          .reduce((a, b) => a.width > b.width ? a : b, { width: 0 })
          .url
      }

      if (resultType === 'video') {
        data.title = textFields[0]
        data.author = textFields[filtered ? 1 : 2]
        data.viewsString = textFields[filtered ? 2 : 3].split(' ')[0]
        data.duration = textFields[filtered ? 3 : 4]
      }

      if (resultType === 'playlist') {
        data.title = textFields[0]
        data.author = textFields[filtered ? 1 : 2]
        data.itemCount = parseInt(textFields[filtered ? 2 : 3].split(' ')[0])
      }

      results.push(data)
    })
  })

  return results
}

module.exports = search
