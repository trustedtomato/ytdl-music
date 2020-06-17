const got = require('got')

const getApiKey = () =>
  got('https://music.youtube.com/search?q=csaknekedkisl%C3%A1ny', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0'
    }
  })
    .then(response => response.body)
    .then(body => body.match(/<\s*script\s*>\s*ytcfg\.set\s*\((.*?)\)\s*;\s*<\s*\/\s*script\s*>/)[1])
    .then(JSON.parse)
    .then(obj => obj.INNERTUBE_API_KEY)

module.exports = getApiKey
