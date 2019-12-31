// 获取document.js

import * as path from 'path';
import * as fs from 'fs';

export default (dir: string) => {
  const suffix = ['.js', '.jsx', '.ts', '.tsx'];
  let DocumentComponent = null;

  let docFile = '';
  for (const item of suffix) {
    docFile = path.join(dir, 'document' + item);
    if (fs.existsSync(docFile)) {
      const _Component = require(docFile);
      DocumentComponent = _Component.default || _Component;
      break;
    }
  }
  return {
    Component: DocumentComponent,
    doc: docFile
  };
};
