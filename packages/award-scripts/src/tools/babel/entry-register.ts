import * as path from 'path';

const pkg = require(path.join(process.cwd(), 'package.json'));
const alias = pkg.alias ? { ...pkg.alias } : {};

export default () => {
  require('@babel/register')({
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
  });
};
