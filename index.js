const argv = require('yargs').argv
const ytdl = require('ytdl-core')
const getMetadata = require('./get-metadata')
const fs = require('fs')
const { spawn } = require('child_process')
const got = require('got')
const pipeline = require('util').promisify(require('stream').pipeline)

ytdl.getInfo(argv._[0]).then(async info => {
  const bestFormat = info.formats
    .reduce((bestFormat, currentFormat) => currentFormat.audioBitrate > bestFormat.audioBitrate ? currentFormat : bestFormat, { audioBitrate: 0 })
  if (!bestFormat) {
    console.log('No audio available!')
    return
  }

  const metadata = await getMetadata(info.video_id)
  const filename = `${metadata.artist} - ${metadata.title}.${bestFormat.container}`
  const mp3Filename = `${metadata.artist} - ${metadata.title}.mp3`
  const imageFilename = `${metadata.artist} - ${metadata.title}.jpg`
  
  const hasAlbumArt = typeof metadata.albumArtUrl === 'string'
  if (hasAlbumArt) {
    console.log('Downloading album art...')
    await pipeline(
      got.stream(metadata.albumArtUrl),
      fs.createWriteStream(imageFilename)
    )
  }

  console.log('Downloading music...')
  ytdl.downloadFromInfo(info, { format: bestFormat })
    .on('progress', (chunk, downloaded, total) => {
      process.stdout.cursorTo(0)
      process.stdout.write(`${Math.floor((downloaded / total) * 100)}%`)
    })
    .pipe(fs.createWriteStream(filename))
    .on('finish', () => {
      process.stdout.write('\n')
      console.log('Converting to mp3...')

      const ffmpegArgs = [
        '-i', filename
      ]

      if (hasAlbumArt) {
        ffmpegArgs.push(
          '-i', imageFilename,
          '-c', 'copy',
          '-map', '1'
        )
      }

      ffmpegArgs.push(
        '-c:a', 'libmp3lame',
        '-map', '0',
        // TODO: escape
        '-metadata', `title=${metadata.title}`,
        '-metadata', `artist=${metadata.artist}`,
        '-metadata', `album_artist=${metadata.artist}`,
        '-metadata', `album=${metadata.album}`,
        mp3Filename
      )

      const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: 'inherit' })
      ffmpeg.on('close', async () => {
        await fs.promises.unlink(imageFilename)
        await fs.promises.unlink(filename)
        console.log(`Successfully downloaded music to ${mp3Filename}`)
      })
    })
})