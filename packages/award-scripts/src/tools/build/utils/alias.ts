import * as path from 'path';

const dir = path.join(process.cwd(), 'node_modules');

export default {
  react: path.join(dir, 'react'),
  'react-dom': path.join(dir, 'react-dom')
};
