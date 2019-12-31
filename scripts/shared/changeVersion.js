/**
 * 修改版本
 */
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const lerna = path.join(__dirname, '..', '..', 'lerna.json');
const versions = require(lerna).versions;
const fs = require('fs');
let tag = argv._[0];

const lastKey = Object.keys(versions).pop();

if (versions[tag]) {
  // 修改当前version
  let pkg = fs.readFileSync(lerna, 'utf-8');
  fs.writeFileSync(lerna, pkg.replace(/"version":(.*)/, `"version": "${versions[tag]}",`));
  // versions对应的+1
  let version = versions[tag];
  if (/\.(\d+)$/.test(version)) {
    const match = version.match(/\.(\d+)$/);
    version = version.replace(/\.(\d+)$/, '.' + (Number(match[1]) + 1));
  } else {
    version = version + '.0';
  }
  pkg = fs.readFileSync(lerna, 'utf-8');
  fs.writeFileSync(
    lerna,
    pkg.replace(new RegExp(`"${tag}":(.*)`), `"${tag}": "${version}"${tag !== lastKey ? ',' : ''}`)
  );
}
