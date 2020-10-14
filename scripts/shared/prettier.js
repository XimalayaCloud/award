const chalk = require('chalk');
const glob = require('glob');
const prettier = require('prettier');
const fs = require('fs');
const md5 = require('md5');
const babel = require('./babel');
const listChangedFiles = require('./listChangedFiles');
const prettierConfigPath = require.resolve('../../.prettierrc');

const argv = require('minimist')(process.argv.slice(2));
const onlyChanged = argv.change ? true : false;
const changedFiles = onlyChanged ? listChangedFiles() : null;

const start = (allPaths, lib = false) => {
  const files = glob
    .sync(allPaths, { ignore: '**/node_modules/**' })
    .filter((f) => !onlyChanged || changedFiles.has(f));

  if (!files.length) {
    return;
  }

  files.forEach((file) => {
    const options = prettier.resolveConfig.sync(file, {
      config: prettierConfigPath
    });
    try {
      let input = fs.readFileSync(file, 'utf8');
      if (lib) {
        input = babel(input);
      }
      const output = prettier.format(input, options);
      if (output !== input) {
        fs.writeFileSync(file, output, 'utf8');
      }
      if (!prettier.check(input, options) && !lib) {
        console.log('美化文件 ', chalk.gray(file));
      }
    } catch (error) {
      console.log('\n\n' + error.message);
      console.log(file);
    }
  });
};

module.exports = start;
