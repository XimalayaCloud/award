import path from 'path';

export default {
  mode: 'server',
  fetch: {
    domainMap: {
      '/api': 'http://127.0.0.1:1234'
    },
    apiGateway: {
      API_RETRY_TIME: 2
    }
  },
  plugins: [path.join(__dirname, 'award-plugin-my')]
};
