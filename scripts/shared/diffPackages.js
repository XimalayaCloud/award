/* eslint-disable @typescript-eslint/prefer-for-of */
/**
 * 分析当前修改的内容是否是packages里面的
 * 如果有，在每次提交前，都需要进行eslint和prettier的检测，才能提交
 */
const execFileSync = require('child_process').execFileSync;

const exec = (command, args) => {
  const options = {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
  };
  return execFileSync(command, args, options);
};

const execGitCmd = args =>
  exec('git', args)
    .trim()
    .toString()
    .split('\n');

const diffPackages = () => {
  const branch = execGitCmd(['symbolic-ref', '--short', '-q', 'HEAD'])[0];
  let diff = [];
  try {
    diff = execGitCmd(['diff', '--name-only', '--diff-filter=ACMRTUB', `origin/${branch}`]);
  } catch (error) {}
  const data = Array.from(new Set([...diff, ...execGitCmd(['ls-files', '--modified'])]));
  for (let i = 0; i < data.length; i++) {
    if (/packages\/(.*)\/src\/(.*)\.tsx?$/.test(data[i])) {
      return true;
    }
  }
  return false;
};

module.exports = diffPackages;
