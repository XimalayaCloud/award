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
      ]
    ],
    plugins: [
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
            '@': './'
          }
        }
      ],
      '@babel/plugin-transform-modules-commonjs'
    ]
  });
};
