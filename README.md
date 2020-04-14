# ytdl-music
A wrapper around ytdl-core for mp3 download.

## Prerequisites
You'll have to have [ffmpeg](https://ffmpeg.org/) installed on your machine.

## Installation
TODO

## Usage
`ytdl-music [url-to-download-from]`

## How does it work?
It uses [ytdl-core](https://www.npmjs.com/package/ytdl-core) to download from YouTube,
then uses [ffmpeg](https://ffmpeg.org/) to convert it into mp3 with the metadata
which it's figured out using [guess-metadata](https://www.npmjs.com/package/guess-metadata)
and a call to [music.youtube.com](https://music.youtube.com/).

For more details, check out the source code, it's less than 200 lines.
