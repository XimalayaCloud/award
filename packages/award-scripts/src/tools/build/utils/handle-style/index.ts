/**
 * 处理第三方样式
 */
import * as path from 'path';
import * as fs from 'fs';
import MiniCssExtractPlugin = require('mini-css-extract-plugin');
import WriteStyleMapPlugin from './plugins/WriteStyleMapPlugin';
import StyleConfig from '../../../style/utils/config';

// const HappyPack = require('happypack');

// const happyThreadPool = HappyPack.ThreadPool({ size: 5 });

// const happyPackConfig = (config: any, lessLoaderSource: any) => {
//   config.module.rules.push(
//     {
//       test: /\.scss$/,
//       loaders: [MiniCssExtractPlugin.loader, 'happypack/loader?id=scss']
//     },
//     {
//       test: /\.less$/,
//       loaders: [MiniCssExtractPlugin.loader, 'happypack/loader?id=less']
//     },
//     {
//       test: /\.css$/,
//       loaders: [MiniCssExtractPlugin.loader, 'happypack/loader?id=css']
//     }
//   );

//   const styleloader: any = [
//     {
//       loader: 'cache-loader'
//     },
//     {
//       loader: 'css-loader'
//     }
//   ];

//   config.plugins.push(
//     new HappyPack({
//       id: 'scss',
//       threadPool: happyThreadPool,
//       loaders: [
//         ...styleloader,
//         {
//           loader: 'sass-loader',
//           options: {
//             sourceMap: false
//           }
//         }
//       ]
//     }),
//     new HappyPack({
//       id: 'less',
//       threadPool: happyThreadPool,
//       loaders: [...styleloader, `less-loader?${JSON.stringify(lessLoaderSource)}`]
//     }),
//     new HappyPack({
//       id: 'css',
//       threadPool: happyThreadPool,
//       loaders: [...styleloader]
//     })
//   );
// };

const normalConfig = (config: any, lessLoaderSource: any) => {
  const styleConfig = StyleConfig();

  const config_autoprefixer: any = styleConfig.plugins
    .filter((item: any) => item[0] === 'autoprefixer')
    .pop();

  const styleloader: any = [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader'
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          require('autoprefixer')({
            overrideBrowserslist: 'last 4 version',
            ...(config_autoprefixer ? config_autoprefixer[1] || {} : {})
          })
        ]
      }
    }
  ];

  config.module.rules.push(
    {
      test: /\.scss$/,
      loaders: [
        ...styleloader,
        {
          loader: 'sass-loader',
          options: {
            sourceMap: false
          }
        }
      ]
    },
    {
      test: /\.less$/,
      loaders: [
        ...styleloader,
        {
          loader: 'less-loader',
          options: {
            lessOptions: lessLoaderSource
          }
        }
      ]
    },
    {
      test: /\.css$/,
      loaders: [...styleloader]
    }
  );
};

export default (
  config: any,
  opts: {
    isServer: boolean;
    isAward: boolean;
    dir: string;
    dev: boolean;
  }
) => {
  const { isServer, dir, dev } = opts;
  if (!isServer) {
    const pkgPath = path.join(dir, 'package.json');
    const pkg = fs.existsSync(pkgPath) ? require(pkgPath) : {};
    let theme: any = null;
    if (pkg.theme && typeof pkg.theme === 'string') {
      let cfgPath = pkg.theme;
      // relative path
      if (cfgPath.charAt(0) === '.') {
        cfgPath = path.resolve(dir, cfgPath);
      }
      theme = require(cfgPath);
    } else if (pkg.theme && typeof pkg.theme === 'object') {
      theme = pkg.theme;
    }

    // 添加antd的import插件
    const lessLoaderSource: any = {
      sourceMap: dev,
      javascriptEnabled: true
    };

    if (theme) {
      lessLoaderSource.modifyVars = theme;
    }

    // if (dev) {
    //   happyPackConfig(config, lessLoaderSource);
    // } else {
    normalConfig(config, lessLoaderSource);
    // }

    config.module.rules.push(
      {
        test: /\.(jpg|png|jpeg|gif)$/,
        use: [
          {
            loader: 'filename-loader',
            options: {
              publicPath: config.output.publicPath
            }
          },
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[hash:7].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        use: [
          {
            loader: 'filename-loader',
            options: {
              publicPath: config.output.publicPath
            }
          },
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
              name: '[hash:7].[ext]'
            }
          }
        ]
      }
    );

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: `styles/module.css`,
        chunkFilename: `styles/module.[name].[hash:5].css`,
        ignoreOrder: true
      }),
      new WriteStyleMapPlugin()
    );
  } else {
    config.module.rules.push({
      test: /\.(css|less|scss|jpg|png|jpeg|gif|ttf|eot|woff|woff2|svg)$/,
      use: ['ignore-loader']
    });
    config.module.rules.push({
      test: /\.(jpg|png|jpeg|gif)$/,
      loader: 'image-loader',
      options: {
        name: '[hash:7].[ext]'
      }
    });
  }
  if (!config.resolveLoader) {
    config.resolveLoader = {};
  }
  if (!config.resolveLoader.modules) {
    config.resolveLoader.modules = ['node_modules'];
  }
  config.resolveLoader.modules.push(path.join(__dirname, 'loaders'));
  return config;
};
