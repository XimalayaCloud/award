import { spawn } from 'child_process';
import * as path from 'path';

export default () => {
  return new Promise<void>((resolve) => {
    const buildFile = path.join(__dirname, './child_process.js');
    const cwd = process.cwd();

    const compiler = spawn('node', [buildFile], {
      cwd,
      stdio: 'inherit'
    });

    compiler.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        process.exit(1);
      }
    });
  });
};
