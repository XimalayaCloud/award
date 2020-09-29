import * as path from 'path';
import * as webpack from 'webpack';
import { getAwardConfig } from 'award-utils/server';
import LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

import { ProgressBarPlugin, ExtractStyle, ReactLoadablePlugin } from '../../webpack-plugins';
import * as TerserPlugin from 'terser-webpack-plugin';
import webpackInclude from '../utils/include';
import { BabelConfig } from '../../babel';
import alias from '../utils/alias';

export default function webConfig({
  entry,
  outPath,
  assetPrefixs,
  dir,
  crossOrigin,
  useRoute
}: {
  entry: string;
  outPath: string;
  assetPrefixs: string;
  dir: string;
  crossOrigin: boolean;
  useRoute: boolean;
}): any {
  const { exportPath } = getAwardConfig();

  const config: any = {
    context: dir,
    entry,
    devtool: 'none',
    output: {
      path: outPath,
      filename: process.env.HASHNAME === '1' ? '[name].js' : 'scripts/[name].js',
      chunkFilename: 'scripts/[chunkhash:6].js',
      jsonpFunction: '__award__',
      publicPath: assetPrefixs
    },
    performance: {
      hints: false
    },
    optimization: {
      minimizer:
        process.env.NODE_ENV === 'production'
          ? [
              /**
               * https://github.com/webpack-contrib/terser-webpack-plugin
               *
               * Unexpected token: punc (()
               * https://github.com/webpack/webpack/issues/5858
               */
              new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
                terserOptions: {
                  ecma: 6,
                  toplevel: true,
                  compress: {
                    pure_funcs: ['console.log']
                  }
                }
              })
            ]
          : [],
      runtimeChunk: {
        name: 'manifest'
      },
      splitChunks: {
        cacheGroups: {
          vendor: {
            // 将公共模块提取出来
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            chunks: 'async',
            name: 'vendor',
            priority: 10,
            enforce: true
          }
        }
      }
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          include: webpackInclude,
          loader: 'babel-loader',
          options: BabelConfig({
            assetPrefixs
          })
        }
      ]
    },
    plugins: [
      new ExtractStyle(entry),
      new LodashModuleReplacementPlugin({
        collections: true,
        paths: true
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          RUN_ENV: JSON.stringify('web'),
          WEB_TYPE: JSON.stringify(process.env.WEB_TYPE),
          Browser: JSON.stringify(process.env.Browser),
          ROUTER: JSON.stringify(process.env.ROUTER),
          USE_ROUTE: JSON.stringify(useRoute ? '1' : '0'),
          ...(process.env.EXPORTRUNHTML === '1' ? { EXPORTPATH: JSON.stringify(exportPath) } : {})
        }
      }),
      new ProgressBarPlugin({
        format: 'web Compiling... [:bar] :percent (:elapsed seconds)',
        clear: false,
        width: 60
      }),
      new FriendlyErrorsWebpackPlugin(),
      new ReactLoadablePlugin({
        filename: path.join(dir, '.award/.awardConfig/react-loadable.json')
      })
    ],
    resolve: {
      alias,
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  };

  if (crossOrigin) {
    config.output.crossOriginLoading = 'anonymous';
  }

  config.plugins.push(
    new webpack.DllReferencePlugin({
      context: '.',
      manifest: require(path.join(dir, '.dll/manifest.json'))
    })
  );

  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.optimize.ModuleConcatenationPlugin()
    );
  }

  return config;
}
