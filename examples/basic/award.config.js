const fs = require('fs');

export default {
  basename: '/abc',
  // mode: 'client',
  fetch: {
    domainMap: {
      '/api': 'http://127.0.0.1:1234'
    }
  }
};
