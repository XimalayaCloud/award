import middleware from '@/middleware';
import path from 'path';

export default {
  app: middlewares => {
    middlewares.splice(0, 0, middleware);
  }
};
