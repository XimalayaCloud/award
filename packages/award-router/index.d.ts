/**
 * Award路由组件，提供3个API
 *
 * `RouterSwitch` 定义路由列表
 *
 * `Route` 定义单个路由，包括路由path、路由组件等
 *
 * `history` 可以调用该api直接push、replace等操作
 */
declare module 'award-router' {
  import RouterSwitch from 'award-router/lib/RouterSwitch';
  import Route from 'award-router/lib/Route';
  import history from 'award-router/lib/history';
  export { RouterSwitch, Route, history };
}
