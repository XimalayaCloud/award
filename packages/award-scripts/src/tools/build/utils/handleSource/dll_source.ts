/**
 * 处理dll的资源文件
 */
import * as fs from 'fs-extra';
import * as MD5 from 'md5';
import { join } from 'path';

export default function dllSource(dir: any, map: any, publicPath: any) {
  // 确认dll文件里面的静态资源，拷贝到client-dist目录
  // 主要拷贝图片和字体资源
  const dllImages = join(dir, '.dll', 'images');
  const dllFonts = join(dir, '.dll', 'fonts');
  const dllStyles = join(dir, '.dll', 'styles', 'module.css');

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
    fs.readdirSync(dllImages).forEach(item => {
      fs.copyFileSync(join(dllImages, item), join(distImages, item));
    });
  }

  if (fs.existsSync(dllFonts)) {
    const distFonts = join(dir, publicPath, 'fonts');
    if (!fs.existsSync(distFonts)) {
      fs.mkdirSync(distFonts);
    }
    fs.readdirSync(dllFonts).forEach(item => {
      fs.copyFileSync(join(dllFonts, item), join(distFonts, item));
    });
  }
}
