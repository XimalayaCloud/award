import * as path from 'path';
import * as fs from 'fs-extra';

const dir = process.cwd();
const awardBabel = path.join(dir, 'award.babel.js');

const pkg = require(path.join(process.cwd(), 'package.json'));
const alias = pkg.alias ? { ...pkg.alias } : {};

export default () => {
  const config = {
    compact: false,
    babelrc: false,
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: '8.11.1'
          },
          modules: 'commonjs'
        }
      ],
      [
        '@babel/preset-typescript',
        {
          onlyRemoveTypeImports: true
        }
      ]
    ],
    plugins: [
      '@babel/plugin-transform-typescript',
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
          root: [process.cwd()],
          alias: {
            '@': './',
            ...alias
          }
        }
      ],
      '@babel/plugin-transform-modules-commonjs'
    ],
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  };

  if (fs.existsSync(awardBabel)) {
    require(awardBabel)({
      config,
      isServer: true,
      dev: true
    });
  }

  require('@babel/register')(config);
};
