export default {
  // mode: 'client',
  fetch: {
    domainMap: {
      '/api': 'http://127.0.0.1:1234'
    },
    apiGateway: {
      API_RETRY_TIME: 2
    }
  }
};
