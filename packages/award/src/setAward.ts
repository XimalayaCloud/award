import loadParams from 'award-utils/loadParams';
import { INITIAL_STATE } from './shared/initial_state';

let setAward: Function | null = null;

/**
 * 客户端全局store
 */
export default (data?: {} | Function) => {
  if (typeof data === 'function') {
    // 存储setAward方法
    setAward = data;
  } else {
    if (process.env.RUN_ENV === 'node') {
      // 如果发现在服务器上执行该方法，说明有问题
      console.warn('setAward方法在服务端不生效');
    } else {
      const { firstRender } = loadParams.get();

      if (firstRender) {
        // 首次渲染，说明还未渲染出setAward处理组件，需要把数据传给INITIAL_STATE
        if (data && data.constructor === Object && Object.keys(data).length) {
          INITIAL_STATE.award = {
            ...INITIAL_STATE.award,
            ...data
          };
        } else {
          console.warn('setAward必须接受一个不为空的对象');
        }
      } else {
        if (typeof setAward === 'function') {
          setAward(data);
        }
      }
    }
  }
};

export const clean = () => {
  setAward = null;
};
