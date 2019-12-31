import { createDOM } from '../../../utils';
import normal from './normal';
import lifecycle from './lifecycle';
import redirect from './redirect';
import spa from './spa';

export default () => {
  normal();
  describe('路由核心逻辑测试', () => {
    beforeEach(() => {
      delete window.jestMock;
      jest.resetAllMocks();
      jest.resetModules();
      history.replaceState({}, '', '/');
      createDOM();
      process.env.USE_ROUTE = '1';
      window.__AWARD__INIT__ROUTES__ = [];
      window.__INITIAL_STATE__ = {};
    });
    lifecycle();
    redirect();
    spa();
  });
};
