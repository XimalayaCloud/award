/* eslint-disable max-depth */
import * as CleanCSS from 'clean-css';
import * as fs from 'fs-extra';
import * as path from 'path';

/**

{
  "0": "f32e536.css",
  "common.js": "7110323cc.js",
  "main": "63f2b3",
  "moduleStyles": { "2447522718": ["module.main.9aef1.css"], "3070095147": [] }
}
 */

const run = (dest: any, value: any) => {
  if (/\.css$/.test(value)) {
    const cssPath = path.join(dest, 'styles', value);
    if (fs.existsSync(cssPath)) {
      const css = fs.readFileSync(cssPath, 'utf-8');
      const output = new CleanCSS({}).minify(css);
      fs.writeFileSync(cssPath, output.styles);
    }
  }
};

export default (map: any, dest: any) => {
  for (let key in map) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      if (key !== 'moduleStyles') {
        run(dest, map[key]);
      } else {
        for (let key in map['moduleStyles']) {
          if (Object.prototype.hasOwnProperty.call(map['moduleStyles'], key)) {
            const item = map['moduleStyles'][key];
            if (item) {
              if (Array.isArray(item)) {
                item.forEach((value: any) => {
                  run(dest, value);
                });
              } else {
                run(dest, item);
              }
            }
          }
        }
      }
    }
  }
};
