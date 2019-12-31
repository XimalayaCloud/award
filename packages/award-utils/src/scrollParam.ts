import { ScrollObject } from 'award-types';

let scrollParams: ScrollObject;

const set = (scrollToParams: ScrollObject) => {
  scrollParams = scrollToParams;
};

const get = () => scrollParams;

export default {
  set,
  get
};
