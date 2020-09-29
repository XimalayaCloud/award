import { IContext, IAny } from 'award-types';
import { loadInitialProps } from 'award-utils';
import nodePlugin from 'award-plugin/node';

export default async (ctx: IContext) => {
  if (ctx.award.cache) {
    return;
  }

  try {
    const RootComponent = ctx.award.RootComponent;
    if (RootComponent) {
      try {
        // 服务端处理，需要和context上下文挂钩
        const setAward = (obj: Object) => {
          if (obj.constructor === Object && Object.keys(obj).length) {
            ctx.award.initialState.award = {
              ...(ctx.award.initialState.award || {}),
              ...obj
            };
          } else {
            console.warn('setAward必须接受一个不为空的对象');
          }
        };

        // 初始化参数
        const initialPropsParams = {
          query: ctx.request.query,
          req: ctx.request,
          setAward,
          routes: ctx.award.match_routes,
          route: null,
          match: null
        };
        await nodePlugin.hooks.modifyInitialPropsCtx({
          params: initialPropsParams,
          context: ctx
        });

        try {
          /**
           * 执行入口的getInitialProps方法
           */
          if (RootComponent.getInitialProps) {
            const _props: IAny = {};
            _props.award = await RootComponent.getInitialProps(initialPropsParams);
            _props.award = {
              ...ctx.award.initialState.award,
              ..._props.award
            };
            ctx.award.initialState = { ...ctx.award.initialState, ..._props };
          }
        } catch (error) {
          // 根组件加载数据发生错误
          ctx.set('X-Award-Fetch', 'root');
          throw error;
        }

        /**
         * 根据匹配到的路由列表，执行对应路由的getInitialProps方法
         */
        const errorPath = { path: null };
        try {
          const loadMatchRoutes: any = [];
          ctx.award.match_routes.forEach((match_route) => {
            if (!match_route.route.client) {
              loadMatchRoutes.push(match_route);
            }
          });

          const { props } = await loadInitialProps(
            loadMatchRoutes,
            ctx.award.search,
            initialPropsParams,
            ctx.award.match_routes,
            errorPath
          );
          if (Object.keys(props).length) {
            ctx.award.initialState = { ...ctx.award.initialState, ...props };
          }
        } catch (error) {
          // 路由组件加载数据发生错误
          ctx.set('X-Award-Fetch', Buffer.from(`【router】${errorPath.path}`).toString('base64'));
          throw error;
        }

        await nodePlugin.hooks.didFetch({ context: ctx });
      } catch (error) {
        ctx.award.error = true;
        // 接口数据出错，默认走路由错误
        if (ctx.award.routes.length) {
          // 存在路由
          ctx.award.routerError = true;
        }

        throw error;
      }
    }
  } catch (error) {
    ctx.status = 500;
    throw error;
  }
};
