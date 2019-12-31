/**
 * 由于路由是按需加载，这里保存路由按需加载后的组件
 */
// {"path":"component"}
const routes: any = {};

const set = (path: any, component: any) => {
  routes[path] = component;
};

const get = (path: any) => routes[path];

export default {
  set,
  get
};
