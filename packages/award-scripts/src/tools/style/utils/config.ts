import * as path from 'path';
import * as fs from 'fs-extra';

const defaultConfig: Config = {
  plugins: [],
  limit: null,
  randomScope: false,
  scopePosition: 'tail'
};

export interface Config {
  plugins: any[];
  limit?: null;
  randomScope?: boolean;
  scopePosition: 'tail' | 'head';
}

export default (): Config => {
  const esConfigPath = path.join(process.cwd(), '.es-style.json');
  let userConfig: Config = {
    plugins: [],
    scopePosition: 'tail'
  };
  if (fs.existsSync(esConfigPath)) {
    userConfig = JSON.parse(fs.readFileSync(esConfigPath, 'utf-8'));
  }

  if (userConfig.scopePosition !== 'tail' && userConfig.scopePosition !== 'head') {
    userConfig.scopePosition = 'tail';
  }
  if (typeof userConfig.randomScope !== 'boolean') {
    userConfig.randomScope = false;
  }
  return { ...defaultConfig, ...userConfig };
};
