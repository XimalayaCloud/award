import BabelConfig from './babel-config';
import { getAwardConfig } from 'award-utils/server';

export default () => {
  let { entry, assetPrefixs, assetOrigin, ip } = getAwardConfig();
  /**
   * 需要特殊注入
   */
  if (assetOrigin) {
    assetPrefixs = `http://${ip}:${process.env.MAIN_PORT}/award_dev_static/`;
  } else {
    assetPrefixs = '/award_dev_static/';
  }
  require('@babel/register')({
    ...BabelConfig({
      write: false,
      isServer: true,
      assetPrefixs,
      ts: /\.tsx?$/.test(entry)
    }),
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  });
};
