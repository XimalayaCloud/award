/**
 * 测试有路由的单页应用
 */
import routes from './routes';

describe('路由测试 - 生产环境', () => {
  process.env.NODE_ENV = 'production';
  routes();
});
