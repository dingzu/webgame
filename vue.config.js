module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
      ? '/webgame/'
      : '/',
    baseUrl: process.env.NODE_ENV === 'production'
      ? '/webgame/'
      : '/'
  }