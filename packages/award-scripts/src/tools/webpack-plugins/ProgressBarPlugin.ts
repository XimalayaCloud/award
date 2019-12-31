/**
 * webpack编译进度条插件
 */
import chalk = require('chalk');
import * as ProgressBar from 'progress';
import * as webpack from 'webpack';

export default class ProgressBarPlugin {
  private stream: any;
  private enabled: any;
  private summaryContent: any;
  private customSummary: any;
  private barOptions: any;
  private bar: any;

  public constructor(options: any = {}) {
    this.stream = options.stream || process.stderr;
    this.enabled = this.stream && this.stream.isTTY;

    const barLeft = chalk.bold('[');
    const barRight = chalk.bold(']');
    const preamble = chalk.cyan.bold(' build ') + barLeft;
    const barFormat =
      options.format || preamble + ':bar' + barRight + chalk.green.bold(' :percent');

    this.summaryContent = options.summaryContent;
    this.customSummary = options.customSummary;
    delete options.format;
    delete options.total;
    delete options.summary;
    delete options.summaryContent;
    delete options.customSummary;

    this.barOptions = {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 100,
      clear: true,
      ...options
    };
    this.bar = new ProgressBar(barFormat, this.barOptions);
  }

  public apply(compiler: any) {
    if (!this.enabled) {
      return;
    }
    let running = false;
    let startTime = 0;
    let lastPercent = 0;
    let cache: any = [];
    new webpack.ProgressPlugin((percent: any, msg: string) => {
      if (!running && lastPercent !== 0 && !this.customSummary) {
        this.stream.write('\n');
      }
      const newPercent = Math.ceil(percent * this.barOptions.width);
      if (lastPercent !== newPercent) {
        if (!global.style_hmr) {
          cache.forEach((item: any) => {
            this.bar.update(item.percent, {
              msg: item.msg
            });
          });
          cache = [];
          this.bar.update(percent, {
            msg
          });
        } else {
          cache.push({
            percent,
            msg
          });
        }

        lastPercent = newPercent;
      }
      if (!running) {
        running = true;
        startTime = Number(new Date());
        lastPercent = 0;
      } else if (percent === 1) {
        const now = Number(new Date());
        const buildTime = (now - startTime) / 1000 + 's';
        this.bar.terminate();
        if (this.summaryContent) {
          this.stream.write(this.summaryContent + '(' + buildTime + ')\n\n');
        }
        if (this.customSummary) {
          this.customSummary(buildTime);
        }
        running = false;
      }
    }).apply(compiler);
  }
}
