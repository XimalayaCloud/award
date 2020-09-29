import * as path from 'path';
import * as fs from 'fs-extra';

const cwd = process.cwd();
const dir = path.join(cwd, 'node_modules');

const reactLib = path.join(dir, 'react');
const reactDomLib = path.join(dir, 'react-dom');

const pkg = require(path.join(cwd, 'package.json'));
const alias = pkg.alias || {};

for (const as in alias) {
  if (Object.prototype.hasOwnProperty.call(alias, as)) {
    const modulePath = alias[as];
    if (!modulePath.includes(dir)) {
      alias[as] = path.join(dir, modulePath);
    }
  }
}

if (fs.existsSync(reactLib)) {
  alias['react'] = reactLib;
}

if (fs.existsSync(reactLib)) {
  alias['react-dom'] = reactDomLib;
}

export default alias;
