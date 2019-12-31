import { IAny } from './util';
export interface INav {
  to: string | IAny;
  exact?: boolean;
  strict?: boolean;
  location?: any;
  activeClassName?: string;
  className?: string;
  activeStyle?: IAny;
  style?: IAny;
  isActive?: Function;
  'aria-current': 'page' | 'step' | 'location' | 'date' | 'time' | 'true';
  children?: React.ReactNode;
  rest: any[];
}
