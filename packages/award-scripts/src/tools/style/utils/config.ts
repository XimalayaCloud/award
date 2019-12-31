import * as path from 'path';
import * as fs from 'fs-extra';

const defaultConfig = {
  plugins: [],
  limit: null
};

export default () => {
  const esConfigPath = path.join(process.cwd(), '.es-style.json');
  let userConfig = {};
  if (fs.existsSync(esConfigPath)) {
    userConfig = JSON.parse(fs.readFileSync(esConfigPath, 'utf-8'));
  }
  return { ...defaultConfig, ...userConfig };
};
