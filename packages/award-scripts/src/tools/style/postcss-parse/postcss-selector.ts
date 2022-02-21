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

        const handleSpecialSelector = (selector: string) => {
          if (scopePosition === 'head') {
            let selectorSplit = '';
            let newSelector: string[] = [];
            if (/>/.test(selector)) {
              newSelector = selector.split('>');
              selectorSplit = '>';
              if (/\+/.test(newSelector[0])) {
                // 如果大于里面有+，那就直接找加即可
                newSelector = selector.split('+');
                selectorSplit = '+';
              }
            } else {
              if (/\+/.test(selector)) {
                newSelector = selector.split('+');
                selectorSplit = '+';
                if (/>/.test(newSelector[0])) {
                  newSelector = selector.split('>');
                  selectorSplit = '>';
                }
              }
            }
            if (selectorSplit && newSelector.length) {
              newSelector[0] = newSelector[0] + uniqueInfo;
              return newSelector.join(selectorSplit);
            }
          }
          return selector;
        };

        selectors.map((item: any, index: any) => {
          const selector = item.split(' ').filter((item: string) => item !== '');
          let scopeSelector =
            scopePosition === 'tail' ? selector[selector.length - 1] : selector[0];

          // 格式化选择器，存在伪类
          if (/:(:)?/.test(scopeSelector)) {
            const match = scopeSelector.match(/(:(:)?.*)/);

            if (match !== null) {
              // 最后一个选择器是伪类
              const newScopeSelector = handleSpecialSelector(scopeSelector);
              if (newScopeSelector === scopeSelector) {
                scopeSelector = scopeSelector.replace(match[0], `${uniqueInfo}${match[0]}`);
              } else {
                scopeSelector = newScopeSelector;
              }
            } else {
              scopeSelector = scopeSelector + uniqueInfo;
            }
          } else {
            if (['body', 'html'].indexOf(scopeSelector) === -1) {
              const newScopeSelector = handleSpecialSelector(scopeSelector);
              if (newScopeSelector === scopeSelector) {
                scopeSelector = scopeSelector + uniqueInfo;
              } else {
                scopeSelector = newScopeSelector;
              }
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
