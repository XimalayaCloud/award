import BabelConfig from './babel-config';
import { getAwardConfig } from 'award-utils/server';

export default () => {
  const { entry, assetPrefixs } = getAwardConfig();
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
