import { MatchedRoute, IAny, ITextObj } from 'award-types';
import { Request } from 'koa';
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
  },
  new_match_routes?: Array<MatchedRoute<{}>>,
  errorPath?: any
): Promise<{ routes: Array<MatchedRoute<{}>>; props: IAny }> => {
  return new Promise(async (resolve, reject) => {
    const props: IAny = {};
    const mrlen = match_routes.length;
    /**
     * 需要对当前的match_routes进行分析，如果route.chain = true
     */
    const chain: Array<MatchedRoute<{}>> = [];
    const sync: Array<MatchedRoute<{}>> = [];
    match_routes.map(mr => {
      if (mr.route.chain) {
        chain.push(mr);
      } else {
        sync.push(mr);
      }
    });

    const runCore = async (item: MatchedRoute, lastData: any, isLast: boolean) => {
      let result = {};
      try {
        const cmp = item.route.component;
        if (cmp && cmp!.getInitialProps) {
          const ctx = {
            ...context,
            routes: new_match_routes || match_routes,
            route: item.route,
            match: item.match
          };

          let _props: any = (await cmp!.getInitialProps(ctx, lastData)) || {};
          if (Array.isArray(_props)) {
            _props = {};
          } else {
            for (const key in _props) {
              if (_props.hasOwnProperty(key)) {
                const val = await _props[key];
                _props[key] = val;
              }
            }
          }
          const _search = isLast && search ? '?' + search : '';
          const path = item.match.url + _search;
          result = {
            ...(props[path] || {}),
            ..._props
          };
          props[path] = result;
        }
        (item as any).result = result;
      } catch (error) {
        if (errorPath) {
          errorPath.path = item.match.path;
        }
        reject(error);
      }
      return result;
    };

    let lastData = null;
    while (chain.length) {
      const item = chain.shift();
      if (item) {
        lastData = await runCore(item, lastData, chain.length ? false : true);
      }
    }

    Promise.all(
      sync.map(async (item: MatchedRoute, index: number) => {
        await runCore(item, null, index === mrlen - 1);
      })
    ).then(() => {
      resolve({ routes: match_routes, props });
    });
  });
};
