import * as webpack from 'webpack';
import LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

import { ProgressBarPlugin, ExtractStyle } from '../../webpack-plugins';
import * as TerserPlugin from 'terser-webpack-plugin';
import webpackInclude from '../utils/include';
import { BabelConfig } from '../../babel';
import alias from '../utils/alias';

export default function webConfig({
  entry,
  outPath,
  assetPrefixs,
  dir,
  crossOrigin
}: {
  entry: string;
  outPath: string;
  assetPrefixs: string;
  dir: string;
  crossOrigin: boolean;
}): any {
  const config: any = {
    context: dir,
    entry,
    devtool: 'none',
    output: {
      path: outPath,
      filename: process.env.HASHNAME === '1' ? '[name].js' : 'scripts/[name].js',
      chunkFilename: 'scripts/[chunkhash:6].js',
      library: process.env.UMD_NAME ? `a;window['${process.env.UMD_NAME}']` : ';window.__award___',
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
          : []
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
          USE_ROUTE: JSON.stringify('0')
        }
      }),
      new ProgressBarPlugin({
        format: 'web Compiling... [:bar] :percent (:elapsed seconds)',
        clear: false,
        width: 60
      }),
      new FriendlyErrorsWebpackPlugin()
    ],
    resolve: {
      alias,
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  };

  if (crossOrigin) {
    config.output.crossOriginLoading = 'anonymous';
  }

  return config;
}
