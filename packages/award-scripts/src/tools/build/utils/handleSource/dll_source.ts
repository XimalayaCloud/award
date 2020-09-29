/**
 * 处理dll的资源文件
 */
import * as fs from 'fs-extra';
import * as MD5 from 'md5';
import { join } from 'path';

export default function dllSource(dir: any, map: any, publicPath: any) {
  let dllDir: any = join(dir, '.dll');
  // 确认dll文件里面的静态资源，拷贝到client-dist目录
  // 主要拷贝图片和字体资源
  // dll导出的公共依赖文件
  const dllImages = join(dllDir, 'images');
  const dllFonts = join(dllDir, 'fonts');
  const dllStyles = join(dllDir, 'styles', 'module.css');
  const Common_js = join(dllDir, 'common.js');

  // 处理common.js文件
  if (fs.existsSync(Common_js)) {
    map['common.js'] =
      process.env.HASHNAME === '1'
        ? MD5(fs.readFileSync(Common_js, 'utf-8')).substr(0, 9) + '.js'
        : 'common.js';
    fs.copySync(Common_js, join(dir, publicPath, 'scripts', map['common.js']));
  }

  // 处理map[0]的main.css
  if (fs.existsSync(dllStyles)) {
    let dllCss = fs.readFileSync(dllStyles, 'utf-8');
    if (!map[0]) {
      map[0] = MD5(dllCss).substr(0, 5) + '.css';
    } else {
      // 读取css内容，进行追加
      dllCss += fs.readFileSync(join(dir, publicPath, 'styles', map[0]), 'utf-8');
    }
    fs.writeFileSync(join(dir, publicPath, 'styles', map[0]), dllCss);
  }

  // 拷贝图片和字体
  if (fs.existsSync(dllImages)) {
    const distImages = join(dir, publicPath, 'images');
    if (!fs.existsSync(distImages)) {
      fs.mkdirSync(distImages);
    }
    fs.readdirSync(dllImages).forEach((item) => {
      fs.copyFileSync(join(dllImages, item), join(distImages, item));
    });
  }

  if (fs.existsSync(dllFonts)) {
    const distFonts = join(dir, publicPath, 'fonts');
    if (!fs.existsSync(distFonts)) {
      fs.mkdirSync(distFonts);
    }
    fs.readdirSync(dllFonts).forEach((item) => {
      fs.copyFileSync(join(dllFonts, item), join(distFonts, item));
    });
  }
}
