import { join, resolve } from 'path';
import * as fs from 'fs-extra';
import nodePlugin from 'award-plugin/node';
import { getAwardConfig } from 'award-utils/server';
import AwardStyleBabel from '../style/babel';

import WritedynamicDataPlugin from './babel-plugins/WritedynamicDataPlugin';
import Hmr from './babel-plugins/hmr';
import CodeSplitting from './babel-plugins/CodeSplitting';
import DropConsole from './babel-plugins/drop_console';
import StartExtend from './babel-plugins/start';
import useRoute from './babel-plugins/useRoute';

const dir = process.cwd();
global.routeFileNames = [];

const awardBabel = join(dir, 'award.babel.js');

/**
 * 获取babel配置
 *
 *    write         是否写文件，默认 true
 *
 *    isServer      是否执行服务端代码的编译, 默认 false
 *
 *    assetPrefixs  静态资源前缀, 默认 '/'
 *
 *    handleStyle   是否处理样式，主要在编译dll时不需要处理样式，默认true
 *
 *    subprocess    规定是否启用子进程，默认为false
 */
export default function getBabelConfig({
  write = true,
  isServer = false,
  assetPrefixs = '/',
  handleStyle = true,
  subprocess = false,
  ts = false,
  dll = false
} = {}) {
  const awardConfig = getAwardConfig();
  const { client_dist, export_dist, entry, plugins: awardPlugins, basename } = awardConfig;

  global.routeFileNames = [join(dir, entry).replace(dir, '')];

  /**
   * 添加jsx和环境polyfill解析preset
   */
  const presets: any = [
    [
      '@babel/preset-env',
      isServer
        ? {
            targets: {
              node: '8.11.1'
            },
            modules: 'commonjs'
          }
        : { targets: '> 0.25%, not dead' }
    ],
    '@babel/preset-react'
  ];

  const plugins: any = [
    [WritedynamicDataPlugin, { basename }],
    'react-require',
    'react-loadable/babel',
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: false,
        regenerator: true
      }
    ],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    'minify-constant-folding',
    [
      'module-resolver',
      {
        root: [dir],
        alias: {
          '@': './'
        }
      }
    ]
  ];

  // ts独有语法解析插件
  if (ts) {
    presets.push('@babel/preset-typescript');
    plugins.push('@babel/plugin-transform-typescript');
  }

  // 异步加载处理插件
  if (!isServer) {
    plugins.push([
      'babel-plugin-import',
      {
        libraryName: 'antd',
        style: true
      }
    ]);
  }

  let exportPath: any;
  let dev = true;
  /**
   * 测试、生产环境处理的插件
   */
  if (/production|test/.test(process.env.NODE_ENV || '')) {
    dev = false;

    exportPath = client_dist;

    if (process.env.WEB_TYPE === 'WEB_SPA') {
      // 单页应用
      exportPath = export_dist + '/dest';
    }

    plugins.push('lodash');

    if (isServer) {
      plugins.push(DropConsole);
    }
  }

  // 公共资源
  if (!subprocess && !dll) {
    plugins.push(
      [
        // 代码拆分
        CodeSplitting,
        {
          isServer,
          ts,
          dev
        }
      ],
      [
        // 注入样式
        AwardStyleBabel,
        {
          ...(handleStyle && !dev
            ? {
                write, // 当前编译过程是写文件，写样式、写图片、写字体等静态资源
                publicPath: assetPrefixs, // 资源前缀，一般设置cdn
                publicEntry: resolve(join(dir, exportPath)) // 资源存放入口
              }
            : {}),
          imageOptions: {
            path: 'images/',
            limit: 50
          },
          fontOptions: {
            path: 'fonts/'
          }
        }
      ]
    );
    if (!isServer) {
      plugins.unshift([StartExtend, { plugins: awardPlugins, dev }]);
    }
  } else {
    // 判断是否使用过路由
    plugins.unshift(useRoute);
  }

  // 发布模式
  const config = {
    compact: false,
    babelrc: false,
    presets,
    plugins
  };

  if (fs.existsSync(awardBabel)) {
    require(awardBabel)({
      config,
      isServer,
      dev
    });
  }
  nodePlugin.hooks.babelConfig({ config, isServer, dev, awardConfig });

  if (dev && !isServer && !dll) {
    config.plugins.push(
      [
        Hmr,
        {
          entry: join(dir, entry)
        }
      ],
      'react-hot-loader/babel'
    );
  }

  if (!isServer) {
    config.plugins.push(
      '@babel/plugin-transform-modules-commonjs',
      '@babel/plugin-syntax-dynamic-import'
    );
  } else {
    config.plugins.unshift('dynamic-import-node');
  }

  return config;
}
