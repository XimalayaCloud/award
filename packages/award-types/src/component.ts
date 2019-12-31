import { ComponentType } from 'react';
import { ILocation } from './location';
import { IMatch } from './match';
import { ICtx } from './ctx';
import { Model } from './model';

export interface IComponent {
  match: IMatch;
  location: ILocation;
  namespace: string;
  LoadingComponent: any;
  model?: any;
}

export type AComponentType<P = {}> = ComponentType<P> & {
  /** 定义静态方法 getInitialProps
   * 该方法返回值将作为该组件的 props 传给当前路由组件
   * 所以路由组件可以通过 props.name 来获取
   * 同时该方法支持异步，接受唯一参数 ctx
   * @param ctx ICtx
   * @returns any
   */
  getInitialProps?: (ctx: ICtx) => any;
  model?: Model | Model[];
  updateProps?: boolean | Function;
  needClient?: boolean;
};
