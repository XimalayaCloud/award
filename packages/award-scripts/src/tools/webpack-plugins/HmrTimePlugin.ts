/**
 * 展示当前热更新最慢的三个阶段
 */
import * as webpack from 'webpack';
import chalk = require('chalk');
import * as fs from 'fs-extra';
import * as path from 'path';

let time = Number(new Date());

const exist = fs.existsSync(path.join(process.cwd(), 'node_modules', 'award'));

export default class HmrTimePlugin {
  private startHmr: boolean;
  private isFirst: boolean;
  private hmrTime: Array<any> = [];

  public constructor() {
    this.startHmr = true;
    this.isFirst = true;
    this.hmrTime = [];
  }

  public apply(compiler: any) {
    new webpack.ProgressPlugin((...args: any) => {
      if (this.startHmr) {
        this.startHmr = false;
        time = Number(new Date());
        return;
      }
      const cur = Number(new Date());
      const timeDiff = cur - time;
      time = cur;

      const l = this.hmrTime.length;
      const value = {
        time: timeDiff,
        module: args
      };

      if (l === 0) {
        this.hmrTime.push(value);
      } else if (l === 1) {
        if (this.hmrTime[0].time > timeDiff) {
          this.hmrTime.unshift(value);
        } else {
          this.hmrTime.push(value);
        }
      } else {
        for (let i = 0; i < l; i++) {
          const item = this.hmrTime[i];
          if (timeDiff < item.time && i > 0 && timeDiff > this.hmrTime[i - 1].time) {
            this.hmrTime.splice(i, -1, value);
            break;
          }
        }
        const newl = this.hmrTime.length;
        if (newl === 4) {
          this.hmrTime.shift();
        } else if (newl === l) {
          if (this.hmrTime[newl - 1].time < timeDiff) {
            if (newl === 3) {
              this.hmrTime.shift();
            }
            this.hmrTime.push(value);
          }
        }
      }
    }).apply(compiler);

    compiler.hooks.done.tap('done', () => {
      this.isFirst = false;
      this.startHmr = true;
      if (this.hmrTime.length) {
        console.info(chalk.yellow('当前项目编译耗时最慢的三个阶段\n'));
        for (let i = this.hmrTime.length - 1; i >= 0; i--) {
          const item = this.hmrTime[i];
          const [, msg, ...moduleInfo] = item.module;
          const info = chalk.yellow(moduleInfo.join(' '));
          console.info(`${chalk.green(item.time + 'ms')}   ${info}  ${chalk.gray(msg)}\n`);
        }
      }
      this.hmrTime = [];
    });

    if (!exist) {
      compiler.hooks.compilation.tap('HmrTimePlugin', (compilation: any) => {
        if (!this.isFirst) {
          compilation.hooks.buildModule.tap('HmrTimePlugin', (moduleInfo: any) => {
            const ident = moduleInfo.identifier();
            console.info(ident);
            console.info();
          });
        }
      });
    }
  }
}
