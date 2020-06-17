const search = require('./ytm-search')
const browse = require('./ytm-browse')
const download = require('./download')
const inquirer = require('inquirer')

// eslint-disable-next-line no-unused-expressions
require('yargs')
  .command(['song [query]', 's'], 'search for a song and download it', (yargs) => {
    yargs.positional('query', {
      describe: 'search query, the text which you usually type into YouTube Music\'s search box'
    })
  }, async (argv) => {
    const songs = await search(argv.query, 'song')
    const { song } = await inquirer.prompt({
      type: 'list',
      name: 'song',
      message: 'Choose a song to download!',
      choices: songs.map(song => ({
        name: `${song.artist} - ${song.title} (${song.album}) ${song.duration}`,
        value: song
      }))
    })
    await download(song.videoId, song)
  })
  .command(['album [query]', 'a'], 'search for an album and download it', (yargs) => {
    yargs.positional('query', {
      describe: 'search query, the text which you usually type into YouTube Music\'s search box'
    })
  }, async (argv) => {
    const albums = await search(argv.query, 'album')
    const { album } = await inquirer.prompt({
      type: 'list',
      name: 'album',
      message: 'Choose an album to download!',
      choices: albums.map(album => ({
        name: `${album.artist} - ${album.title}`,
        value: album
      }))
    })
    const albumDetails = await browse(album.browseId)
    const tracks = albumDetails.musicTracks.map(track => ({
      ...track,
      trackCount: albumDetails.trackCount,
      albumDuration: albumDetails.duration,
      releaseDate: albumDetails.releaseDate,
      artist: albumDetails.artists
        .map(({ name }) => name)
        .join(' / '),
      albumArtist: albumDetails.albumArtist
    }))
    console.log(tracks)
  })
  .argv
