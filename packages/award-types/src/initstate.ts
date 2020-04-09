import { AComponentType } from './component';

export interface IinitState {
  award: {
    [key: string]: any;
  };
  AwardException?: IAwardException;
}

export interface IAwardException {
  ErrorComponent?: AComponentType;
  status?: string | number;
  message?: string | null;
  stack?: string | null;
  info?: Object;
  url?: string | null;
  routerError?: boolean;
  data?: Object;
  pathname?: any;
}
