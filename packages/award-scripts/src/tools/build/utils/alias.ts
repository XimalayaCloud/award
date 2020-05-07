import * as path from 'path';
import * as fs from 'fs-extra';

const dir = path.join(process.cwd(), 'node_modules');

const alias: any = {};
const reactLib = path.join(dir, 'react');
const reactDomLib = path.join(dir, 'react-dom');

if (fs.existsSync(reactLib)) {
  alias['react'] = reactLib;
}

if (fs.existsSync(reactLib)) {
  alias['react-dom'] = reactDomLib;
}

export default alias;
