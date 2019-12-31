/**
 * 主要用来加载关联的所有bundle文件
 *
 * 加载bundle.js文件
 *
 * 注意，这里的routes，都是每次路由切换匹配的新的路由列表，所有里面的数据结构都是全新的
 */
import routeComponents from './routeComponents';
import { MatchedRoute, IAny } from 'award-types';

export default (routes: Array<MatchedRoute<{}>>, search: string, award_initialState?: IAny) => {
  const rlength = routes.length;
  return Promise.all(
    routes.map(async ({ route, match }, index) => {
      const key = match.url + (rlength === index + 1 && search ? '?' + search : '');

      // 数据池没有数据，设置了loading，则优先渲染loading，之后再去获取数据
      // 即存在loading不需要优先初始化数据
      // 数据池不存在，根据路由来判定
      route.needInitiProps = !route.loading;

      // 数据池有数据，且当前地址在数据池也存在数据，那么久不需要初始化数据
      // 也就是说，该url已经在前端单页应用中访问过了，那么将直接从缓存中获取数据
      // 这个时候就算设置了loading，loading也不会再现了，相当于从缓存中获取数据
      // 但是后续还是会获取数据，保证页面数据的最新
      // 但是如果触发了热更新，在路由的AsyncRender组件需要重新获取
      if (
        award_initialState &&
        award_initialState[key] &&
        Object.keys(award_initialState[key]).length
      ) {
        route.needInitiProps = false;
      }

      if (!route.sync) {
        // 非同步组件，加载bundle，同时更新路由组件
        const cmt = route.component as Function;
        // 当前是异步组件时，判断是否已经加载过了
        if (cmt && !route.componentLoaded && typeof cmt === 'function') {
          route.component = await new Promise(resolve => {
            cmt((mod: any) => {
              resolve(mod.default ? mod.default : mod);
            });
          });
          route.componentLoaded = true;
        }
      }
      routeComponents.set(route.path, route.component);
    })
  );
};
