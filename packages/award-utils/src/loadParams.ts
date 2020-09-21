/**
 * 首次加载的参数
 */

const params: any = {
  ssr: false,
  firstRender: true,
  isRenderRouter: false,
  /** 标识是否切换路由 */
  isSwitchRouter: false,
  basename: '',
  routes: []
};

export const set = ({
  ssr,
  firstRender,
  basename,
  isRenderRouter,
  routes,
  isSwitchRouter
}: {
  ssr?: boolean;
  firstRender?: boolean;
  basename?: string;
  isRenderRouter?: boolean;
  routes?: any;
  isSwitchRouter?: boolean;
}) => {
  if (typeof firstRender !== 'undefined') {
    params.firstRender = firstRender;
  }

  if (typeof ssr !== 'undefined') {
    params.ssr = ssr;
  }

  if (typeof basename !== 'undefined') {
    params.basename = basename;
  }

  if (typeof isRenderRouter !== 'undefined') {
    params.isRenderRouter = isRenderRouter;
  }

  if (typeof routes !== 'undefined') {
    params.routes = routes;
  }

  if (typeof isSwitchRouter !== 'undefined') {
    params.isSwitchRouter = isSwitchRouter;
  }
};

export const get = () => params;

export default {
  set,
  get
};
