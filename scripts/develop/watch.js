const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const dir = path.join(__dirname, '..', '..', 'dist');
const cwd = process.cwd();
const split = os.type() === 'Windows_NT' ? '\\' : '/';

module.exports = () => {
  chokidar.watch(dir).on('all', (event, originPath) => {
    const ch = originPath.replace(dir, '');
    const pre = ch
      .split(split)
      .splice(0, 3)
      .join(split);
    const last = ch
      .split(split)
      .splice(4)
      .join(split);

    if (last.length) {
      const newPath = path.join(cwd, pre, 'lib', last);
      if (event === 'addDir') {
        if (!fs.existsSync(newPath)) {
          fs.mkdirpSync(newPath);
        }
      } else {
        if (!fs.existsSync(newPath)) {
          fs.createFileSync(newPath);
        }
        fs.copyFileSync(originPath, newPath);
        if (/\.map$/.test(originPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(originPath, 'utf-8'));
            data.sources.forEach((item, index) => {
              data.sources[index] = item
                .split('/')
                .splice(1)
                .join('/');
            });
            fs.writeFileSync(newPath, JSON.stringify(data));
          } catch (error) {}
        }
      }
    }
  });
};
