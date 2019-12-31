/**
 * 首次加载的参数
 */

const params = {
  ssr: false,
  firstRender: true,
  isRenderRouter: false,
  basename: '',
  routes: []
};

export const set = ({
  ssr,
  firstRender,
  basename,
  isRenderRouter,
  routes
}: {
  ssr?: boolean;
  firstRender?: boolean;
  basename?: string;
  isRenderRouter?: boolean;
  routes?: any;
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
};

export const get = () => params;

export default {
  set,
  get
};
