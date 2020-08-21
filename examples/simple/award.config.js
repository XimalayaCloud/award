import middleware from '@/middleware';

export default {
  app: middlewares => {
    middlewares.splice(0, 0, middleware);
  }
};
