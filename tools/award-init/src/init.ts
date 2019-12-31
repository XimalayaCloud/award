import * as path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import * as ora from 'ora';
import * as fs from 'fs';
import * as os from 'os';
import * as urllib from 'urllib';
import homedir = require('node-homedir');
import * as inquirer from 'inquirer';
import assert = require('assert');
import * as ini from 'ini';
import * as compressing from 'compressing';
import { sync as rm } from 'rimraf';
import generate from './generate';

const cwd = process.cwd();

export default class InitCommand {
  private tpl = 'award-template-simple';
  private name = 'award-init';
  private to = cwd;
  private httpClient: any;
  private targetName: any = null;

  public constructor() {
    const args = require('minimist')(process.argv.slice(2));
    if (args.t || args.tpl) {
      this.tpl = 'award-template-' + args.tpl || args.t;
    }
    this.httpClient = urllib.create();
    const name = args._[0];
    if (name) {
      this.targetName = name;
      this.to = path.join(cwd, name);
    }
    this.log('target ', this.to);
  }

  private async curl(url: string, options: any) {
    return await this.httpClient.request(url, options);
  }

  private async getPackageInfo(pkgName: string) {
    this.log(`fetching npm info of ${pkgName}`);
    try {
      const url = `${this.getRegistry()}/${pkgName}/latest`;
      const result = await this.curl(url, {
        dataType: 'json',
        followRedirect: true,
        maxRedirects: 5,
        timeout: 5000
      });
      assert(
        result.status === 200,
        `npm info ${pkgName} got error: ${result.status}, ${result.data.reason}`
      );
      return result.data;
    } catch (err) {
      console.error(err.message);
      process.exit(-1);
    }
  }

  private async downloadTemplate(pkgName: string) {
    const result = await this.getPackageInfo(pkgName);
    const tgzUrl = result.dist.tarball;

    this.log(`downloading ${tgzUrl}`);

    const saveDir = path.join(os.tmpdir(), 'award-init-tmpleate');
    rm(saveDir);

    const response = await this.curl(tgzUrl, { streaming: true, followRedirect: true });
    await compressing.tgz.uncompress(response.res, saveDir);

    this.log(`extract to ${saveDir}`);
    return path.join(saveDir, '/package');
  }

  private getRegistry() {
    const home = homedir();
    let url =
      process.env.npm_registry || process.env.npm_config_registry || 'https://registry.npmjs.org';
    if (fs.existsSync(path.join(home, '.cnpmrc')) || fs.existsSync(path.join(home, '.tnpmrc'))) {
      url = 'https://registry.npm.taobao.org';
    }
    const npmrc = path.join(home, '.npmrc');
    if (fs.existsSync(npmrc)) {
      const data = ini.parse(fs.readFileSync(npmrc, 'utf-8'));
      if (data.registry) {
        url = data.registry;
      }
    }
    url = url.replace(/\/$/, '');
    return url;
  }

  public run() {
    inquirer
      .prompt([
        {
          type: 'confirm',
          message: this.targetName
            ? `您确定在目录 ${chalk.yellow(this.targetName)} 中初始化项目模板?`
            : '您确定在当前目录中初始化项目模板，这将会清空当前文件夹？',
          name: 'ok'
        }
      ])
      .then(async (answers: any) => {
        if (answers.ok) {
          const tmp: string = await this.downloadTemplate(this.tpl);
          if (this.targetName) {
            rm(this.to);
          } else {
            // 清空当前文件夹
            const spinner = ora(`正在清空当前文件夹...`);
            try {
              spinner.start();
              const node_modules = path.join(cwd, 'node_modules');
              if (fs.existsSync(node_modules)) {
                // 重命名
                fs.renameSync(node_modules, path.join(cwd, '.node_modules'));
              }
              fs.readdirSync(cwd).map(item => {
                if (item !== '.node_modules' && item !== '.git' && item !== '.gitignore') {
                  rm(path.join(cwd, item));
                }
              });
              spawn('node', [path.join(__dirname, 'utils', 'rm.js')]);
              spinner.stop();
            } catch (error) {
              spinner.stop();
              console.error(error);
              process.exit();
            }
          }
          generate(tmp, this.to, () => {
            if (fs.existsSync(tmp)) {
              rm(tmp);
            }
          });
        }
      });
  }

  private log(...args: any[]) {
    args[0] = chalk.gray(`[${this.name}] `) + args[0];
    console.log.apply(console, args);
  }
}

module.exports = InitCommand;
