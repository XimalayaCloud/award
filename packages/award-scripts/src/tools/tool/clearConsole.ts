import * as readline from 'readline';

export default () => {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows as number);
    console.info(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
  }
};
