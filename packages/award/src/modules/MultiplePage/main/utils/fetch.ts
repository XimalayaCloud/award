/**
 * 这里是服务于单页面应用初始化页面时候的函数实现
 */
import { queryObj, loadInitialProps, Exception, search, loadParams } from 'award-utils';
import { AComponentType, IinitState, ITextObj, MatchedRoute } from 'award-types';
import clientPlugin from 'award-plugin/client';
import setAward from '../../../../setAward';

export default async (
  Component: AComponentType,
  match_routes: Array<MatchedRoute<{}>>,
  INITIAL_STATE: IinitState,
  routes: any
) => {
  const searchInfo = search();
  const { ssr } = loadParams.get();
  const query: ITextObj = queryObj(searchInfo);
  let needInitialRoutes = [];
  try {
    needInitialRoutes = match_routes.filter(
      match_route => (!ssr && match_route.route.needInitiProps) || match_route.route.client
    );

    if (needInitialRoutes.length || !ssr) {
      /**
       * 初始化非路由组件的数据，即挂载在入口组件的getInitialProps方法的实现
       */
      const initialPropsParams = {
        location: window.location,
        query,
        setAward,
        routes,
        route: null,
        match: null
      };
      await clientPlugin.hooks.modifyInitialPropsCtx({
        params: initialPropsParams
      });
      if (Component.getInitialProps && !ssr) {
        const rootProps = await Component.getInitialProps(initialPropsParams);
        INITIAL_STATE.award = {
          ...INITIAL_STATE.award,
          ...rootProps
        };
      }

      // 加载下个路由对应页面的数据
      const { props } = await loadInitialProps(
        needInitialRoutes,
        searchInfo,
        initialPropsParams,
        match_routes
      );

      needInitialRoutes.forEach(item => {
        item.route.client = false;
      });

      if (Object.keys(props).length) {
        Object.assign(INITIAL_STATE, props);
      }
    }

    // 通过RouterSwtich绑定的回调修改数据
  } catch (err) {
    clientPlugin.hooks.catchError({ type: 'fetch', error: err });
    INITIAL_STATE.AwardException = await Exception.handleError.call(null, err);
  }
  return Boolean(needInitialRoutes.length);
};
