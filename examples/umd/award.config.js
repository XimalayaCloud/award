export default {
  assetPrefixs: './dist/',
  mode: 'client',
  webpack(config) {
    config.output.library = 'a;window.abc';
    config.externals = [
      function (context, request, callback) {
        if (request === 'react') {
          return callback(null, 'global React');
        }
        if (request === 'react-dom') {
          return callback(null, 'global ReactDOM');
        }
        if (request === 'moment') {
          return callback(null, 'global moment');
        }
        if (request === 'antd') {
          return callback(null, 'global antd');
        }
        callback();
      }
    ];
    return config;
  }
};
