/**
 * 列出和master分支修改的内容
 */

const execFileSync = require('child_process').execFileSync;

const exec = (command, args) => {
  console.log('> ' + [command].concat(args).join(' '));
  const options = {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
  };
  return execFileSync(command, args, options);
};

const execGitCmd = (args) => exec('git', args).trim().toString().split('\n');

const listChangedFiles = () => {
  const branch = execGitCmd(['symbolic-ref', '--short', '-q', 'HEAD'])[0];
  const mergeBase = execGitCmd(['merge-base', 'HEAD', `origin/${branch}`]);
  return new Set([
    ...execGitCmd(['diff', '--name-only', '--diff-filter=ACMRTUB', mergeBase]),
    ...execGitCmd(['ls-files', '--others', '--exclude-standard'])
  ]);
};

module.exports = listChangedFiles;
