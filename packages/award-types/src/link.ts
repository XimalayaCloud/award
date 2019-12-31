import { IAny } from './util';
export interface ILink {
  onClick?: Function;
  target?: string;
  replace?: boolean;
  top?: boolean;
  x?: string | Function;
  y?: string | Function;
  to: string | IAny;
  innerRef?: string | Function;
  data?: any;
  className?: string;
  style: any;
}
