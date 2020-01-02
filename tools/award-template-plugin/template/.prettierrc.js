/**
 * 官方配置参数说明
 *
 * https://prettier.io/docs/en/options.html
 */
module.exports = {
  semi: true, // 分号
  bracketSpacing: true, // 对象括号空格。
  singleQuote: true, // 单引号
  jsxBracketSameLine: false, // jsx不放在同一行
  trailingComma: 'none', // 不接逗号
  printWidth: 100,
  parser: 'babel',
  tabWidth: 2,

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript'
      }
    },
    {
      files: ['.prettierrc.js', '.eslintrc.js'],
      options: {}
    },
    {
      files: '**.json',
      options: {
        parser: 'json'
      }
    }
  ]
};
