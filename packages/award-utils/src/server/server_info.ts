import { join } from 'path';
import * as _ from 'lodash';
import { IServer, IAny } from 'award-types';
import getIPAdress from './getIPAdress';

const reset = '\x1B[0m';

const boldGreenBright = (str: string) => {
  return '\x1B[1m' + '\x1B[92m' + str + reset + reset;
};

const cyan = (str: string) => {
  return '\x1B[36m' + str + reset;
};

export default function(this: IServer, show = true) {
  const ip = getIPAdress();
  show = this.apiServer || !show ? false : true;
  const projectPkg: IAny & { name: string } = require(join(this.dir, 'package.json'));
  const http = this.port === '443' ? 'https' : 'http';
  let url = http + '://localhost:' + this.port;
  if (show) {
    console.info(`You can now view ${boldGreenBright(projectPkg.name)} in the browser.`);
    console.info();
    console.info(
      `   ${boldGreenBright('Local:')}              ${http}://localhost:${boldGreenBright(
        this.port.toString()
      )}`
    );
  }

  if (!_.isUndefined(ip) && ip) {
    url = http + '://' + ip + ':' + this.port;
    if (show) {
      console.info(
        `   ${boldGreenBright('On Your Network:')}    ${http}://${ip}:${boldGreenBright(
          this.port.toString()
        )}`
      );
    }
  }

  if (show) {
    console.info();
  }
  if (this.dev) {
    if (show) {
      console.info(`Note that the development build is not optimized`);
      console.info(`To create a production build, use ${cyan('yarn award build')}.`);
    }
  } else {
    const logFilterInfo = this.logFilterInfo;
    let options: any = {};
    const length = logFilterInfo.length;
    if (length) {
      const last = logFilterInfo.pop();
      if (_.isPlainObject(last)) {
        options = last;
      } else if (last) {
        logFilterInfo.push(last);
      }
    }
    const globalLog = global.console.log;
    global.console.log = function log() {
      if (length) {
        const args = Array.from(arguments);
        for (let i = 0; i < length; i++) {
          const key = args.indexOf(logFilterInfo[i]);
          if (key !== -1) {
            if (_.isBoolean(options[logFilterInfo[i]]) && !options[logFilterInfo[i]]) {
              args.splice(key, 1);
            }
          }
        }
        globalLog(...args);
      }
    };
    delete (global as any).AppRegistry;
  }
  return url;
}
