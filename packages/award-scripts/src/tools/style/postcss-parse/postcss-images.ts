/* eslint-disable max-nested-callbacks */
import * as postcss from 'postcss';
import parseImage from '../utils/parse-image';
import htmlElementList from '../utils/html-element-list';

export default postcss.plugin(
  'postcss-images',
  ({ publicEntry, imageOptions, write, publicPath, elementSelectors, state }: any = {}) => {
    return (root: any) => {
      root.walkRules((rule: any) => {
        // 记录class选择器，主要用来生成随机的class时防止冲突
        // 忽略keyframs内的过渡选择器
        // img::hover
        // .main div{}
        // .main div.ab{}
        // .main div,.main span{}
        // div{}
        if (rule.parent.type !== 'atrule' && rule.parent.name !== 'keyframes') {
          rule.selector.split(',').forEach((selectors: any) => {
            selectors.split(' ').forEach((selector: any) => {
              // 伪类选择器
              selector.split(':').forEach((_selector: any) => {
                if (
                  htmlElementList.indexOf(_selector) !== -1 &&
                  elementSelectors.indexOf(_selector) === -1
                ) {
                  elementSelectors.push(_selector);
                }
              });
            });
          });
        }

        rule.walkDecls((decl: any) => {
          // 引用多url列出来
          const urls = decl.value.match(/url\([^\)]+\)/g);

          if (urls) {
            // 查询css的value是否存在url(<地址>)
            urls.forEach((url: any) => {
              const match = url.match(/url\(['|"]?(.*\.(jpg|png|gif|jpeg|svg)(\?.*)?)['|"]?\)/g);
              if (match) {
                // 匹配到数组形式
                match.forEach((item: any) => {
                  /**
                   * 有下面几种形式
                   * url(a.jpg)
                   * url("a.jpg")
                   * url('a.jpg')
                   * url(./a.jpg)
                   */
                  // 匹配出内容区域
                  let content = item.replace(
                    /^url\(["|']?(.*)(jpg|png|gif|jpeg|svg)(\?.*[^"|'])?["|']?\)/,
                    '$1$2\\$3'
                  );
                  content = content.split('\\');
                  let url: any = content[0];

                  // 从style里面解释样式资源
                  const itemValue = item.replace(
                    content.join(''),
                    parseImage({
                      url,
                      reference: root.source.input.file,
                      write,
                      imageOptions,
                      publicEntry,
                      publicPath: publicPath === './' ? '../' : publicPath,
                      state
                    })
                  );
                  decl.value = decl.value.replace(item, itemValue);
                });
              }
            });
          }
        });
      });
    };
  }
);
