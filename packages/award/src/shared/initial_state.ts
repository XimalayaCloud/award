import { IinitState } from 'award-types';

// 初始化数据
export let INITIAL_STATE: IinitState = {
  award: {}
};

export default () => {
  const win_INITIAL_STATE = window.__INITIAL_STATE__ || {};
  // 合并award对象
  const award = {
    ...(win_INITIAL_STATE.award || {}),
    ...INITIAL_STATE.award
  };
  // 合并所有值
  INITIAL_STATE = {
    ...win_INITIAL_STATE,
    award
  };
};
