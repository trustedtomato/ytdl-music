const ytdl = require('ytdl-core')
const getMetadata = require('./get-metadata')
const fs = require('fs')
const { spawn } = require('child_process')
const got = require('got')
const { promisify } = require('util')
const pipeline = promisify(require('stream').pipeline)

const download = async (id, metadata = null) => {
  const info = await ytdl.getInfo(id)
  const bestFormat = info.formats
    .reduce((bestFormat, currentFormat) => currentFormat.audioBitrate > bestFormat.audioBitrate ? currentFormat : bestFormat, { audioBitrate: 0 })
  if (!bestFormat) {
    console.log('No audio available!')
    return
  }

  if (metadata === null) {
    metadata = await getMetadata(info.video_id)
  }

  const filename = `${metadata.artist} - ${metadata.title}.${bestFormat.container}`
  const mp3Filename = `${metadata.artist} - ${metadata.title}.mp3`
  const imageFilename = `${metadata.artist} - ${metadata.title}.jpg`

  const hasAlbumArt = typeof metadata.albumArtUrl === 'string'
  if (hasAlbumArt) {
    await fs.promises.access(imageFilename, fs.constants.R_OK).catch(async () => {
      // Cannot read the imageFilename, thus we have to download the cover.
      console.log('Downloading album art...')
      await pipeline(
        got.stream(metadata.albumArtUrl),
        fs.createWriteStream(imageFilename, { flags: 'wx' })
      // The two streams might fail in special cases,
      // but we don't really have to worry about them
      // since they are rare and do not cause any real harm.
      ).catch(() => {})
    })
  }

  console.log('Downloading music...')

  return await new Promise((resolve, reject) => {
    ytdl.downloadFromInfo(info, { format: bestFormat })
      .on('progress', (chunk, downloaded, total) => {
        process.stdout.cursorTo(0)
        process.stdout.write(`${Math.floor((downloaded / total) * 100)}%`)
      })
      .pipe(fs.createWriteStream(filename))
      .on('error', reject)
      .on('finish', () => {
        process.stdout.write('\n')
        console.log('Converting to mp3...')

        const ffmpegArgs = [
          '-i', filename
        ]

        if (hasAlbumArt) {
          ffmpegArgs.push(
            // Use the image as the video stream
            '-i', imageFilename,
            '-c', 'copy',
            '-map', '1'
          )
        }

        ffmpegArgs.push(
          '-c:a', 'libmp3lame',
          // Only use the audio stream from the video
          '-map', '0:a',
          // TODO: escape?
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
          resolve()
        })
      })
  })
}

module.exports = download
