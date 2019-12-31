/**
 * 这里是服务于单页面应用初始化页面时候的函数实现
 */
import { IinitState, AComponentType } from 'award-types';
import Exception from 'award-utils/Exception';
import { queryObj } from 'award-utils/search';
import clientPlugin from 'award-plugin/client';
import setAward from '../../setAward';

export default async (Component: AComponentType, INITIAL_STATE: IinitState) => {
  let award = INITIAL_STATE.award;

  try {
    /**
     * 初始化非路由组件的数据，即挂载在入口组件的getInitialProps方法的实现
     */
    if (Component.getInitialProps) {
      const initialPropsParams = {
        query: queryObj(),
        setAward,
        routes: [],
        route: null
      };
      await clientPlugin.hooks.modifyInitialPropsCtx({
        params: initialPropsParams
      });

      const props = await Component.getInitialProps(initialPropsParams);
      INITIAL_STATE.award = {
        ...INITIAL_STATE.award,
        ...award,
        ...(Array.isArray(props) ? {} : props)
      };
    }

    // 通过RouterSwtich绑定的回调修改数据
  } catch (err) {
    clientPlugin.hooks.catchError({ type: 'fetch', error: err });
    INITIAL_STATE.AwardException = await Exception.handleError.call(null, err);
  }
};
