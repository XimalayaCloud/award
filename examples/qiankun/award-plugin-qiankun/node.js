const Plugin = require('award-plugin').default;
const path = require('path');

const root = process.cwd();

module.exports = class extends Plugin.Node {
  apply() {
    this.config((hooks) => {
      hooks.awardConfig((params) => {
        params.mode = 'client';
        params.assetOrigin = true;
      });

      hooks.webpackConfig((params) => {
        if (params.dll) {
          params.config.output.library = `a;window.award_[hash:5]`;
        } else {
          const { name } = require(path.join(root, 'package.json'));
          params.config.output.library = `${name}-[name]`;
          params.config.output.libraryTarget = 'umd';
          params.config.output.jsonpFunction = `webpackJsonp_${name}`;
          params.config.output.globalObject = 'window';
          if (params.dev) {
            const entry = params.config.entry.pop();
            params.config.entry = entry;
            params.config.plugins.splice(6, 1);
            params.config.plugins.splice(6, 1);
            params.config.resolve.alias['react-dom'] = require.resolve('react-dom');
          }
        }
      });

      hooks.babelConfig((params) => {
        let key = 0;
        params.config.plugins.forEach((item, index) => {
          if (item === 'react-hot-loader/babel') {
            key = index;
          }
        });
        if (key !== 0) {
          params.config.plugins.splice(key - 1, 1);
          params.config.plugins.splice(key - 1, 1);
        }
      });
    });
  }
};
