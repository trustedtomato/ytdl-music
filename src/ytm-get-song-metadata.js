const got = require('got')
const context = require('./ytm-context')
const headers = require('./ytm-headers')

const params = '?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'
const baseUrl = 'https://music.youtube.com/youtubei/v1/'

const getSongMetadata = async (videoId) => {
  const { body } = await got.post(baseUrl + 'next' + params, {
    headers,
    json: {
      context,
      enablePersistentPlaylistPanel: true,
      videoId
    },
    responseType: 'json'
  })

  const metadata = body.contents?.singleColumnMusicWatchNextResultsRenderer?.metadataScreen?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents[0]?.musicWatchMetadataRenderer
  if (!metadata) return null

  const title = metadata.title.runs.map(({ text }) => text).join(' ')
  const album = metadata.albumName?.runs.map(({ text }) => text).join(' ')
  const artist = metadata.byline.runs.find(run => run?.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType === 'MUSIC_PAGE_TYPE_ARTIST').text

  return {
    title,
    album,
    artist
  }
}

module.exports = getSongMetadata
