const apiGateway = {
  API_APIGATEWAY_OPEN: true,
  API_RETRY_TIME: 2,
  INNER_SOUTHGATE: '',
  PATH: '/'
};

if (process.env.API_ENV === '1') {
  apiGateway.INNER_SOUTHGATE = '127.0.0.1:10809';
}

module.exports = {
  fetch: {
    domainMap: {
      '/api/list': 'http://127.0.0.1:10809'
    },
    apiGateway
  }
};
