import node, { register, unregister } from './node';
import {
  INmodifyContextAward,
  INmodifyInitialPropsCtx,
  INwillFetch,
  INwillCache,
  INdidFetch,
  IwebpackConfig,
  IwebpackCompiler,
  CustomMiddlewares,
  IbeforeBuild,
  IafterBuild,
  IbeforeRender,
  IrenderToStringComponent,
  IafterRender,
  IbabelConfig,
  Idocument,
  Isource,
  IBeforeRun
} from '../../types/node';
import { IConfig } from 'packages/award-types/src';

// 在这里定义node端的插件时机的名称

const serverName = [
  'sync beforeRun',
  'modifyContextAward',
  'modifyInitialPropsCtx',
  'willCache',
  'willFetch',
  'didFetch',
  'beforeCoreMiddlewares',
  'afterCoreMiddlewares'
];

const renderName = ['beforeRender', 'render', 'document', 'afterRender'];

const buildName = ['beforeBuild', 'source', 'afterBuild', 'sync babelInclude'];

const configName = ['sync awardConfig', 'webpackConfig', 'sync babelConfig'];

const compilerName = ['webpackCompiler'];

const names = [...serverName, ...renderName, ...buildName, ...configName, ...compilerName];

const hooks: {
  /** node服务启动前 该钩子只支持同步 */
  beforeRun: (params: IBeforeRun) => void;

  /** 修改ctx.award的变量结构，原则上只允许添加，不允许删除 */
  modifyContextAward: (params: INmodifyContextAward) => Promise<any>;
  /** 修改服务端运行时`getInitialProps`函数接收的参数 */
  modifyInitialPropsCtx: (params: INmodifyInitialPropsCtx) => Promise<any>;
  /** 即将执行cache中间件，触发该函数 */
  willCache: (params: INwillCache) => Promise<any>;
  /** 即将要开始fetch数据时，触发该函数 */
  willFetch: (params: INwillFetch) => Promise<any>;
  /** 服务端fetch执行后触发 */
  didFetch: (params: INdidFetch) => Promise<any>;
  /** 处理webpack配置文件 */
  webpackConfig: (params: IwebpackConfig) => Promise<any>;

  /** 处理webpack编译后的compiler */
  webpackCompiler: (params: IwebpackCompiler) => Promise<any>;

  /** 在award内部的核心中间件之前注入中间件的hook函数 */
  beforeCoreMiddlewares: (params: CustomMiddlewares) => Promise<any>;

  /** 在award内部的核心中间件之后注入中间件的hook函数 */
  afterCoreMiddlewares: (params: CustomMiddlewares) => Promise<any>;

  /** award项目执行`award build`构建命令之前 */
  beforeBuild: (params: IbeforeBuild) => Promise<any>;

  /** award项目执行`award build`构建命令之后 */
  afterBuild: (params: IafterBuild) => Promise<any>;

  /**  award在服务端渲染之前，即在执行`renderToString`函数之前一行 */
  beforeRender: (params: IbeforeRender) => Promise<any>;

  /** 执行`renderToString`函数所接受的参数 */
  render: (params: IrenderToStringComponent) => Promise<any>;

  /** award在服务端渲染之后，即在执行`renderToString`函数之后一行 */
  afterRender: (params: IafterRender) => Promise<any>;

  /** 修改awardConfig */
  awardConfig: (params: IConfig) => void;

  /** 添加新的babel配置，该钩子只支持同步 */
  babelConfig: (params: IbabelConfig) => void;

  /** 整理document文档结构 */
  document: (params: Idocument) => Promise<any>;

  /** source */
  source: (params: Isource) => Promise<any>;

  /** 处理babel插件include，该钩子只支持同步 */
  babelInclude: (filePath: string) => any;
} = node(names);

export default {
  hooks,
  register,
  unregister() {
    unregister(names);
  },
  names: {
    server: serverName,
    build: buildName,
    config: configName,
    compiler: compilerName,
    render: renderName
  }
};
