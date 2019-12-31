import * as del from 'del';
import * as fs from 'fs-extra';

export default function clean(dist: string) {
  // 千万不能把根项目删掉
  if (fs.existsSync(dist) && dist !== process.cwd()) {
    return del.sync(dist, { force: true });
  }
  return null;
}
