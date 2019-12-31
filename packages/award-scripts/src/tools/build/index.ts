import prodWeb from './prod/web';
import prodNode from './prod/node';

export interface Idev {
  web: Function;
}

export interface IProd {
  web: Function;
  node: Function;
}

export const prod: IProd = {
  web: prodWeb,
  node: prodNode
};

export default {
  prod
};
