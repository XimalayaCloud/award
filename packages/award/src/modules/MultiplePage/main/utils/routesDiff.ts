import { MatchedRoute } from 'award-types';

let preRoutes: Array<MatchedRoute>;
let preSearch: string;

/**
 * findDiff
 * 查找前后路由不同部分，以后一个路由为准
 * @param  nextRoutes 匹配到的路由数组
 * @param  search     查询参数
 */
export default (nextRoutes: Array<MatchedRoute<{}>>, nextSearch: string, callback?: Function) => {
  let res: Array<MatchedRoute<{}>> = [];
  if (!preRoutes) {
    res = nextRoutes;
  } else {
    /**
     * 特殊情况路由path
     *        /home
     *        /home/:id?
     *
     * /home/10 => /home
     *
     * 会同时匹配这两个path，需要已第一个匹配的为基准，判断条件为存在相同的match.url
     *
     * 筛选出存在多个相同的match.url
     */
    const ignore = [];
    const newNextRoutes = [];
    for (let j = 0; j < nextRoutes.length; j++) {
      if (ignore.indexOf(j) !== -1) {
        // 当前重复，忽略本次循环，进行下次循环
        continue;
      }
      for (let s = j + 1; s < nextRoutes.length; s++) {
        if (nextRoutes[j].match.url === nextRoutes[s].match.url) {
          ignore.push(s);
        }
      }
      newNextRoutes.push({ ...nextRoutes[j] });
    }

    nextRoutes = newNextRoutes;

    let i;
    for (i = 0; i < nextRoutes.length; i++) {
      const item = nextRoutes[i];
      if (!preRoutes[i] || item.match.url !== preRoutes[i].match.url) {
        res.push(item);
      }
    }
    // /home/list => /home  获取/home
    if (i && i === nextRoutes.length && preRoutes[i] && !res.length) {
      res.push(nextRoutes[i - 1]);
    }
    // 路由不变，查询参数有变，返回最后一个路由
    if (nextRoutes.length && !res.length && preSearch !== nextSearch) {
      res = [nextRoutes[nextRoutes.length - 1]];
    }
  }

  if (typeof callback === 'function') {
    callback(() => {
      preRoutes = nextRoutes;
      preSearch = nextSearch;
    });
  } else {
    preRoutes = nextRoutes;
    preSearch = nextSearch;
  }

  return res;
};
