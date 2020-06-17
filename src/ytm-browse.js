const got = require('got')
const context = require('./ytm-context')
const headers = require('./ytm-headers')

const params = '?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'
const baseUrl = 'https://music.youtube.com/youtubei/v1/'

const browse = async (browseId) => {
  const { body } = await got.post(baseUrl + 'browse' + params, {
    headers,
    json: {
      context,
      browseId
    },
    responseType: 'json'
  })
  const mutationPayloads = body.frameworkUpdates.entityBatchUpdate.mutations.map(mutation => mutation.payload)
  const albumData = mutationPayloads
    .find(({ musicAlbumRelease }) => musicAlbumRelease)
    .musicAlbumRelease
  const albumDetails = mutationPayloads
    .find(({ musicAlbumReleaseDetail }) => musicAlbumReleaseDetail)
    .musicAlbumReleaseDetail
  const artists = mutationPayloads
    .filter(({ musicArtist }) => musicArtist)
    .map(({ musicArtist: { name, externalChannelId } }) => ({
      name,
      id: externalChannelId
    }))
  const musicTracks = mutationPayloads
    .filter(({ musicTrack }) => musicTrack)
    .map(({ musicTrack: { videoId, title, lengthMs, albumTrackIndex } }) => ({
      title,
      duration: parseInt(lengthMs),
      index: parseInt(albumTrackIndex),
      videoId
    }))
    .sort((a, b) => a.index - b.index)
  return {
    title: albumData.title,
    trackCount: parseInt(albumData.trackCount),
    duration: parseInt(albumData.durationMs),
    playlistId: albumData.audioPlaylistId,
    releaseDate: new Date(
      albumData.releaseDate.year,
      albumData.releaseDate.month - 1,
      albumData.releaseDate.day
    ),
    description: albumDetails.description,
    albumArtist: albumData.artistDisplayName,
    artists,
    musicTracks
  }
}

module.exports = browse
