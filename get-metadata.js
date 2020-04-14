const guessMetadata = require('guess-metadata')
const got = require('got')
const queryString = require('query-string')

module.exports = async id =>
  got(`https://www.youtube.com/get_video_info?html5=1&video_id=${id}&cpn=KMV1jbykhU_ted-d&eurl&el=detailpage&hl=en_US&list=OLAK5uy_nhFewuG-aYt7t85pGbRvBgC4r88-kADX8&sts=18359&lact=5344&c=WEB_REMIX&cver=0.1&cplayer=UNIPLAYER&itct=CCEQyCAYCCITCJe5scmB6OgCFdOi3godR_QFqzIDQkZhSNiLzY3ew9-T1AE%3D`)
    .then(response => response.body)
    .then(queryString.parse)
    .then(obj => obj.player_response)
    .then(JSON.parse)
    .then(obj => obj)
    .then(({ videoDetails: { thumbnail: { thumbnails }, keywords, title: videoTitle, author } }) => {
      const guessedMetadata = guessMetadata(videoTitle)
      let title = videoTitle
      let artist = author.replace(/- Topic$/, '')
      let album = undefined
      if (guessedMetadata.artist) {
        title = guessedMetadata.title
        artist = guessedMetadata.artist
      } else {
        if (keywords.length <= 3 && keywords[1].toLowerCase() !== title.toLowerCase()) {
          album = keywords[1]
        }
      }

      // Default album name to song title
      if (!album) {
        album = title
      }

      // Get largest square thumbnail
      const largestThumbnail = thumbnails.reduce(
        (previousThumbnail, thumbnail) =>
          previousThumbnail.width < thumbnail.width && thumbnail.width === thumbnail.height
          ? thumbnail
          : previousThumbnail,
        { width: 0 }
      )
      const albumArtUrl = largestThumbnail.url

      return {
        albumArtUrl,
        album: album.trim(),
        artist: artist.trim(),
        title: title.trim()
      }
    })