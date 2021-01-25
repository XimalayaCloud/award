/* eslint-disable max-nested-callbacks */
/* eslint-disable array-callback-return */
import * as postcss from 'postcss';

export default postcss.plugin(
  'postcss-selector',
  (opt: { styleId: string; scopePosition: 'tail' | 'head' }) => {
    const { styleId, scopePosition } = opt;
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
          const selector = item.split(' ').filter((item: string) => item !== '');
          let scopeSelector =
            scopePosition === 'tail' ? selector[selector.length - 1] : selector[0];

          // 格式化选择器，存在伪类
          if (/:(:)?/.test(scopeSelector)) {
            const match = scopeSelector.match(/(:(:)?.*)/);

            if (match !== null) {
              // 最后一个选择器是伪类
              scopeSelector = scopeSelector.replace(match[0], `${uniqueInfo}${match[0]}`);
            } else {
              scopeSelector = scopeSelector + uniqueInfo;
            }
          } else {
            if (['body', 'html'].indexOf(scopeSelector) === -1) {
              scopeSelector = scopeSelector + uniqueInfo;
            }
          }

          if (scopePosition === 'tail') {
            selector[selector.length - 1] = scopeSelector;
          } else {
            selector[0] = scopeSelector;
          }

          selectors[index] = selector.join(' ');
        });

        rule.selector = selectors.join(',');
      });
    };
  }
);
