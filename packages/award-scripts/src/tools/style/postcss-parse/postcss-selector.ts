/* eslint-disable array-callback-return */
import * as postcss from 'postcss';

export default postcss.plugin('postcss-selector', styleId => {
  let uniqueInfo = `.${styleId}`;

  return (root: any) => {
    root.walkRules((rule: any) => {
      // 忽略keyframs内的过渡选择器
      if (rule.parent.type === 'atrule') {
        if (rule.parent.name === 'keyframes') {
          return;
        }
      }

      const selectors = rule.selector.split(',');

      selectors.map((item: any, index: any) => {
        // 格式化选择器，存在伪类
        if (/:(:)?/.test(item)) {
          // 判断是否是a,b这样的选择器
          // 存在伪类,针对最后一个进行处理
          const _selector = item.split(' ');

          let _last = _selector[_selector.length - 1];
          const _match = _last.match(/(:(:)?.*)/);

          if (_match !== null) {
            // 最后一个选择器是伪类
            _last = _last.replace(_match[0], `${uniqueInfo}${_match[0]}`);

            _selector[_selector.length - 1] = _last;

            item = _selector.join(' ');
          } else {
            item = item + uniqueInfo;
          }
        } else {
          if (['body', 'html'].indexOf(item.trim()) === -1) {
            item = item + uniqueInfo;
          }
        }

        selectors[index] = item;
      });

      rule.selector = selectors.join(',');
    });
  };
});
