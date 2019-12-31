/**
 * 开启子进程进行check
 */
import * as inquirer from 'inquirer';

const port = process.argv.slice(2)[0];

inquirer
  .prompt({
    type: 'confirm',
    message: '端口【' + port + '】 已经被占用，是否关闭该端口？',
    name: 'target'
  })
  .then((answers: any) => {
    if (answers.target) {
      process.exit(0);
    } else {
      process.exit(-1);
    }
  });
