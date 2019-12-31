/**
 * 这里是服务于单页面应用初始化页面时候的函数实现
 */
import { queryObj, Exception, search } from 'award-utils';
import { IinitState, ITextObj } from 'award-types';
import clientPlugin from 'award-plugin/client';
import setAward from '../../../../setAward';

export default async (getInitialProps: Function, INITIAL_STATE: IinitState, routes: any) => {
  if (getInitialProps) {
    const searchInfo = search();
    const query: ITextObj = queryObj(searchInfo);
    try {
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

      const rootProps = await getInitialProps(initialPropsParams);
      INITIAL_STATE.award = {
        ...INITIAL_STATE.award,
        ...rootProps
      };
    } catch (err) {
      clientPlugin.hooks.catchError({ type: 'fetch', error: err });
      INITIAL_STATE.AwardException = await Exception.handleError.call(null, err);
    }
  }
};
