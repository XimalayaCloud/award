import { Context } from 'koa';
import { IAwardConfig } from './config';
import { Routes, MatchedRoute } from './routes';
import { IinitState } from './initstate';
import { AComponentType } from './component';

export interface IContext extends Context {
  logTime: number;
  award: {
    dir: string;
    map: Object;
    dev?: boolean;
    url: string;
    search: string;
    isMock?: boolean;
    isProxy?: boolean;
    /** 所有路由 */
    routes: Routes;
    /** 当前请求匹配的路由列表 */
    match_routes: Array<MatchedRoute<{}>>;
    /** 入口组件 */
    RootComponent: AComponentType;
    /** document类型组件 */
    RootDocumentComponent: AComponentType;
    /** award框架数据 */
    initialState: IinitState;
    /** award配置 */
    config: IAwardConfig;
    /**  渲染后的html */
    html: string;
    /** 是否需要缓存 */
    cache: boolean | object;
    manifest: any;
    /** 标识是否发生错误 */
    error: boolean;
    /** 标识错误类型是否路由内错误还是路由外 */
    routerError: boolean;
    /** 判断是否匹配到: 没有匹配到 但是路由不为空且路由不是斜杠 */
    match: boolean;
    /** react-loadable */
    modules: Array<any>;
  };
}
