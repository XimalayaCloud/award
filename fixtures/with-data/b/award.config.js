module.exports = {
  fetch: {
    domainMap: {
      '/api/list': 'http://127.0.0.1:11909'
    },
    apiGateway: {
      API_RETRY_TIME: 2
    }
  },
  plugins: ['award-plugin-demo', ['award-plugin-test-demo', {}]]
};
