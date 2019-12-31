/* eslint-disable array-callback-return */
import * as postcss from 'postcss';
import * as CleanCSS from 'clean-css';
import * as del from 'del';
import { join } from 'path';
import DefaultHashString = require('string-hash');

import Config from '../utils/config';
import { dev } from '../utils';
import { getHashByReference } from '../../tool/createProjectFileHash';

// postcss插件
import postcssSprites from './postcss-sprites';
import postcssSelector from './postcss-selector';
import postcssImages from './postcss-images';
import postcssFont from './postcss-font';

// 存储全局的样式的hashString，保证唯一性
const StoreGlobalStyle: any = [];
const plugins: any[] = [];
const config = Config();
const cwd = process.cwd();

// 通过node-sass解析并获取style字符串
const content = (givenPath: any) =>
  require('node-sass')
    .renderSync({ file: givenPath })
    .css.toString();

// postcss批量处理
const handleStyleByPostcss = (styles: any, _plugins: any, isGlobal: any) => {
  return new Promise((resolve, reject) => {
    if (styles.length) {
      Promise.all(
        styles.map(async (item: any) => {
          // 解析css样式
          const { css } = await postcss(_plugins).process(item.css, {
            from: item.from
          });
          // 压缩css文件
          const output = new CleanCSS({}).minify(css);
          if (isGlobal && !dev()) {
            const globalId = DefaultHashString(output.styles);
            // 筛选出重复的全局样式引用
            if (StoreGlobalStyle.indexOf(globalId) === -1) {
              StoreGlobalStyle.push(globalId);
              return output.styles;
            } else {
              return '';
            }
          } else {
            return output.styles;
          }
        })
      )
        .then(style => {
          resolve(style.join(''));
        })
        .catch(error => {
          reject(error);
        });
    } else {
      resolve('');
    }
  });
};

/**
 * 分析插件
 */
(() => {
  const sprites: any = config.plugins.filter((item: any) => item[0] === 'postcss-sprites').pop();

  if (sprites) {
    const spritesOptions = sprites[1];
    if (spritesOptions.spritePath) {
      // 删掉存放雪碧图的目录
      if (spritesOptions.spritePath === '.es-style') {
        throw new Error('spritePath 不能设置为 .es-style');
      }
      del(join(cwd, spritesOptions.spritePath), { force: true });
    }
  }

  const config_autoprefixer = config.plugins
    .filter((item: any) => item[0] === 'autoprefixer')
    .pop();
  const config_postcssSprites = config.plugins
    .filter((item: any) => item[0] === 'postcss-sprites')
    .pop();

  let autoprefixerOptions = {};
  let postcssSpritesOptions = {};

  if (config_autoprefixer) {
    autoprefixerOptions = config_autoprefixer[1];
  }

  if (config_postcssSprites) {
    postcssSpritesOptions = config_postcssSprites[1];
  }

  plugins.push(
    postcssSprites({
      spritePath: `.es-sprites`,
      hooks: {
        onSaveSpritesheet: (opts: any, { extension, image }: any) => {
          return join(
            opts.spritePath,
            ['sprite_' + DefaultHashString(image.toString()), extension].join('.')
          );
        }
      },
      ...postcssSpritesOptions
    }),
    require('autoprefixer')({
      overrideBrowserslist: 'last 4 version',
      ...autoprefixerOptions
    })
  );

  // 过滤不需要进行处理的插件
  const _plugins = config.plugins.filter(
    (item: any) =>
      ['cssnano', 'postcss-modules', 'postcss-sprites', 'autoprefixer'].indexOf(item[0]) === -1
  );

  // 保存新的plugins,并且防止多次引用,
  let _tmpPlugin: any = [];
  if (_plugins.length) {
    _plugins.map(
      (item: any) =>
        _tmpPlugin.indexOf(item[0]) === -1 &&
        _tmpPlugin.push(item[0]) &&
        plugins.push(require(item[0])(item[1]))
    );
  }
})();

// 将css字符串经过postcss插件进行二次操作
export default (state: any) => {
  const reference = state && state.file && state.file.opts.filename;
  let imageOptions = state && state.opts && state.opts.imageOptions;
  let fontOptions = state && state.opts && state.opts.fontOptions;
  const publicPath = (state && state.opts && state.opts.publicPath) || '/';
  const publicEntry = (state && state.opts && state.opts.publicEntry) || './dist';
  const write = (state && state.opts && state.opts.write) || false;

  if (typeof imageOptions === 'undefined') {
    imageOptions = {};
  }

  if (typeof fontOptions === 'undefined') {
    fontOptions = {};
  }

  if (config.limit) {
    imageOptions.limit = config.limit;
  }

  const _plugins = [
    ...plugins,
    postcssImages({
      write,
      imageOptions,
      publicEntry,
      publicPath,
      elementSelectors: state.elementSelectors,
      state
    }),
    postcssFont({
      reference,
      write,
      fontOptions,
      publicEntry,
      publicPath,
      state
    })
  ];

  return new Promise(async (resolve, reject) => {
    try {
      // sass读取样式资源文件内容，并重新赋值state.styles的属性
      state.styles.jsx.map((item: any, index: number) => {
        state.styles.jsx[index].css = !/\.(j|t)sx?$/.test(item.from)
          ? content(item.from)
          : state.scopeCSS;
      });

      state.styles.global.map((item: any, index: number) => {
        state.styles.global[index].css = content(item.from);
      });

      // 需要对全局样式的选择器进行过滤识别处理，即不能携带和scope一致的选择器
      const globalStyle = await handleStyleByPostcss(state.styles.global, _plugins, true);
      let jsxStyle: any = await handleStyleByPostcss(state.styles.jsx, _plugins, false);
      let styleId = jsxStyle ? getHashByReference(reference) : 0;

      if (styleId) {
        if (dev()) {
          // 在开发阶段，为了防止热更新时样式不生效，需要带上随机的hash码
          styleId = styleId + DefaultHashString(jsxStyle);
        }
        // 拼接scopeId
        const { css } = await postcss([postcssSelector(styleId)]).process(jsxStyle, {
          from: undefined
        });
        jsxStyle = css;
      }

      resolve({
        global: globalStyle,
        jsx: jsxStyle,
        styleId
      });
    } catch (err) {
      reject(err);
    }
  });
};
