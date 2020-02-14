export default {
  router: 'hash',
  mode: 'client',
  assetPrefixs: './',
  hashName: false,
  // basename: '/test/a',
  fetch: {
    domainMap: {
      '/api': 'http://127.0.0.1:1234'
    }
  }
};
