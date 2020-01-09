import * as path from 'path';
import * as webpack from 'webpack';
import { BabelConfig } from '../../babel';
import LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
import { ProgressBarPlugin, ExtractStyle, ReactLoadablePlugin } from '../../webpack-plugins';
import * as TerserPlugin from 'terser-webpack-plugin';
import webpackInclude from '../utils/include';

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
      jsonpFunction: '__award__',
      publicPath: assetPrefixs
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
        },
        {
          test: /\.tsx?$/,
          include: webpackInclude,
          loader: 'ts-loader'
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
          RUN_ENV: JSON.stringify('web')
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
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  };

  if (crossOrigin) {
    config.output.crossOriginLoading = 'anonymous';
  }

  let manifestFile: any = null;
  if (process.env.NODE_ENV === 'production') {
    manifestFile = path.join(dir, '.dll/manifest.json');
  } else {
    manifestFile = path.join(dir, 'node_modules', '.cache', 'award', '.dll/manifest.json');
  }

  config.plugins.push(
    new webpack.DllReferencePlugin({
      context: '.',
      manifest: require(manifestFile)
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
