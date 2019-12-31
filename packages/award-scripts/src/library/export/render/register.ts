import { BabelConfig } from '../../../tools/babel';
import { IConfig } from 'award-types';

export default (config: IConfig) => {
  const { entry } = config;
  const babelConfig = BabelConfig({
    write: false,
    isServer: true,
    assetPrefixs: config.assetPrefixs,
    ts: /\.tsx?$/.test(entry)
  });
  babelConfig.plugins.push('@babel/plugin-transform-modules-commonjs');

  require('@babel/register')({
    ...babelConfig,
    cache: false,
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  });
};
