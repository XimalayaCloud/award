import { MatchedRoute, IAny, ITextObj } from 'award-types';
import { Request } from 'koa';
import fetch from 'award-fetch';

/**
 * 主要用来初始化所有和当前路由关联的page级别组件的getInitialProps方法
 * match_routes 经过路由diff计算后的路由集合
 * search 当前访问地址的search部分
 * context 当前传值
 * new_match_routes 当前匹配到的完整数组集合
 */
export default (
  match_routes: Array<MatchedRoute<{}>>,
  search: string,
  context: {
    req?: Request;
    location?: IAny;
    query: ITextObj;
    setAward: (obj: Object) => void;
    fetch?: any;
  },
  new_match_routes?: Array<MatchedRoute<{}>>,
  errorPath?: any
): Promise<{ routes: Array<MatchedRoute<{}>>; props: IAny }> => {
  return new Promise((resolve, reject) => {
    const props: IAny = {};
    const mrlen = match_routes.length;
    Promise.all(
      match_routes.map(async (item: MatchedRoute, index: number) => {
        try {
          const cmp = item.route.component;
          let _props: any = {};
          if (cmp && cmp!.getInitialProps) {
            const ctx = {
              ...context,
              routes: new_match_routes || match_routes,
              route: item.route,
              match: item.match,
              fetch: context.fetch || fetch
            };

            // 针对 {a: promise, b: promise}
            _props = (await cmp!.getInitialProps(ctx)) || {};
            if (Array.isArray(_props)) {
              // return Promise.all()
              _props = {};
            } else {
              for (const key in _props) {
                if (_props.hasOwnProperty(key)) {
                  const val = await _props[key];
                  _props[key] = val;
                }
              }
            }
            const _search = index === mrlen - 1 && search ? '?' + search : '';
            const path = item.match.url + _search;
            props[path] = {
              ...(props[path] || {}),
              ..._props
            };
          }
        } catch (error) {
          if (errorPath) {
            errorPath.path = item.match.path;
          }
          throw error;
        }
      })
    )
      .then(() => {
        resolve({ routes: match_routes, props });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
