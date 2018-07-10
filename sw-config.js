module.exports = {
  staticFileGlobs: [
    'public/css/**.css',
    'public/**/**.html',
    'public/**/**.jpg',
    'public/**/**.png',
    'public/js/**.js'
  ],
  runtimeCaching: [
    {
      urlPattern: /\/\/cdn/g,
      handler: 'networkFirst'
    }
  ],
  stripPrefix: 'public',
}
