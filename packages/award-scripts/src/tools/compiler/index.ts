/**
 * 启动子进程来执行路由解析工作
 */
import { spawn } from 'child_process';
import { join } from 'path';
import * as fs from 'fs-extra';
import { killPortProcess } from 'kill-port-process';
import { clean } from '../tool';

export default () => {
  const cwd = process.cwd();
  const doneFile = join(cwd, 'node_modules', 'compiler.done');
  clean(doneFile);
  const serverFile = join(__dirname, './server.js');
  if (fs.existsSync(serverFile)) {
    const compiler = spawn(
      'node',
      [...(process.env.AWARD_DEBUG ? ['--inspect=127.0.0.1:12340'] : []), serverFile],
      {
        cwd,
        stdio: 'inherit'
      }
    );

    const close = (isSIGINT: boolean) => {
      try {
        process.kill(compiler.pid);
      } catch (error) {}
      try {
        killPortProcess(Number(process.env.CHILDPROCESS_COMPILER_PORT));
      } catch (error) {}
      if (isSIGINT) {
        process.exit(0);
      }
    };

    global.EventEmitter.on('close_compiler_process', () => {
      close(false);
    });

    process.on('SIGINT', () => {
      close(true);
    });
    process.on('exit', () => {
      close(true);
    });
  }
};
