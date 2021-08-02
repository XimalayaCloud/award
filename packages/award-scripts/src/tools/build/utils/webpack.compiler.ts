import * as webpack from 'webpack';
import { isFunction } from 'lodash';
import nodePlugin from 'award-plugin/node';
import moduleStyleConfig from './handle-style';
import CustomArray from './customArray';
import { getAwardConfig } from 'award-utils/server';

export default async (
  configWebpack: Function | undefined,
  wpConfig: any,
  options: {
    isServer: boolean;
    isAward: boolean;
    dir: string;
    dev: boolean;
    dll?: boolean;
    isUmd?: boolean;
  }
) => {
  let newConfig = moduleStyleConfig(wpConfig, options);
  if (configWebpack) {
    if (!isFunction(configWebpack)) {
      throw new Error('award.config.js: "webpack" is not a function');
    }

    (newConfig.module as any).rules = new CustomArray(...((newConfig.module as any).rules || []));

    newConfig = configWebpack(newConfig, options);

    // 恢复传统数组
    (newConfig.module as any).rules = Array.from((newConfig.module as any).rules);
  }
  const awardConfig = getAwardConfig();
  await nodePlugin.hooks.webpackConfig({ config: newConfig, ...options, awardConfig });
  const compiler = webpack(newConfig);
  await nodePlugin.hooks.webpackCompiler({ compiler, config: newConfig, ...options, awardConfig });
  return compiler;
};
