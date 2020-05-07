import * as path from 'path';

export const CACHE_DIR = path.join(process.cwd(), 'node_modules', '.cache', 'award');

export default {
  /** award缓存文件地址：`node_modules/.cache/award` */
  CACHE_DIR
};
