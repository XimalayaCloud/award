module.exports = {
  fetch: {
    domainMap: {
      '/api/list': 'http://127.0.0.1:10909',
      '/api/test': 'http://127.0.0.1:11909',
      'api/detail': 'http://127.0.0.1:10909',
      'api/music': '127.0.0.1:10909'
    },
    apiGateway: {
      API_RETRY_TIME: 2
    }
  }
};
