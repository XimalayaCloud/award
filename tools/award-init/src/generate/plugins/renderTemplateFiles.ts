/**
 * 基于ejs模板语法规则，渲染当前模板语法
 */
import * as async from 'async';
import { ejs } from 'consolidate';

export default (files: any, metalsmith: any, done: any) => {
  const info = metalsmith.metadata();
  async.each(
    Object.keys(files).filter(file => {
      let match = true;
      if (/node_modules/.test(file) || /\.(png|gif|jpe?g|ttf|eot|woff|woff2)$/.test(file)) {
        match = false;
      }
      info.cliIgnoreFile.forEach((ignore: any) => {
        if (new RegExp(ignore).test(file)) {
          match = false;
        }
      });
      return match;
    }),
    (file, next) => {
      const str = files[file].contents.toString();

      ejs.render(str, info, (err, res) => {
        if (err) {
          err.message = `[${file}] ${err.message}`;
          return next(err);
        }
        files[file].contents = new Buffer(res);
        next();
      });
    },
    done
  );
};
