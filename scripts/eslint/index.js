/**
 * 代码语法检测
 *
 * 执行命令
 *
 * 1. 指定某个package，不指定，默认全部
 * 2. --change 只检测git发生变化的代码
 * 3. --test 检测测试代码，即__tests__和__mocks__文件夹
 * npm run eslint -- <指定某个package> --change --test
 *
 */

const minimatch = require('minimatch');
const chalk = require('chalk');
const argv = require('minimist')(process.argv.slice(2));
const CLIEngine = require('eslint').CLIEngine;
const listChangedFiles = require('../shared/listChangedFiles');
const options = require('../../.eslintrc.js');

let changedFiles = null;
function runESLintOnFilesWithOptions(filePatterns, onlyChanged) {
  const cli = new CLIEngine(options);
  const formatter = cli.getFormatter();

  if (onlyChanged && changedFiles === null) {
    changedFiles = [...listChangedFiles()];
  }
  const finalFilePatterns = onlyChanged ? intersect(changedFiles, filePatterns) : filePatterns;

  const report = cli.executeOnFiles(finalFilePatterns);

  const messages = report.results.filter((item) => {
    if (!onlyChanged) {
      return true;
    }
    const ignoreMessage =
      'File ignored because of a matching ignore pattern. Use "--no-ignore" to override.';
    return !(item.messages[0] && item.messages[0].message === ignoreMessage);
  });

  const ignoredMessageCount = report.results.length - messages.length;
  return {
    output: formatter(messages),
    errorCount: report.errorCount,
    warningCount: report.warningCount - ignoredMessageCount
  };
}

function intersect(files, patterns) {
  let intersection = [];
  patterns.forEach((pattern) => {
    intersection = [...intersection, ...minimatch.match(files, pattern, { matchBase: true })];
  });
  return [...new Set(intersection)];
}

function runESLint() {
  const onlyChanged = argv.change ? true : false;
  const package = argv._[0];
  let allPaths = package
    ? [`packages/${package}/src/**/*.{ts,tsx}`]
    : [`packages/**/src/**/*.{ts,tsx}`];

  if (argv.test) {
    allPaths = [`packages/${package}/{__tests__,__mocks__}/**/*.{ts,tsx}`];
  }

  if (package) {
    console.log(chalk.green(`🏖  Linting ${package} files...`));
  } else {
    console.log(chalk.green(`🏖  Linting ${onlyChanged ? 'changed' : 'all'} files...`));
  }

  const { errorCount, warningCount, output } = runESLintOnFilesWithOptions(allPaths, onlyChanged);
  if (output) {
    console.log(output);
  }
  return errorCount === 0 && warningCount === 0;
}

if (runESLint()) {
  console.log(chalk.yellow('🎉 Lint passed.'));
} else {
  console.log(chalk.red('☹️ Lint failed.'));
  process.exit(1);
}
