const getMetadata = require('./get-metadata')

const ids = [
  'uV8CkNVunxc',
  '2vqkJ1_1-Bk',
  'wls8sZxlXy4',
  'vHVKjhLiGNI',
  'JuklRMZj7CA',
  '3CRFBB9ZSAQ',
  'u4IaJQOwco0',
  '7vTuroqfswQ',
  '49zga3j91i8',
  'U2XTySC1C54',
  'pzhVBsR-mLA',
  'Zc_MJxHOrb8',
  'MR3uP7IYz44',
  'rjsNNcsUNzE',
  'hqVn9UT9hKg'
]

;(async function () {
  for (const id of ids) {
    const metadata = await getMetadata(id)
    console.log(metadata)
  }
})()
