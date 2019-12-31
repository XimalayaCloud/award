---
id: node
title: Node端Hook
sidebar_label: Node端Hook
---

## 重要说明

> 请务必阅读上一章内容，大体建立对Award插件的认识
> 
> ⚠️ 着重说明 ⚠️ 以下的hook列表中，hook的标题没有特殊标识的，那么该hook支持`同步`和`异步`
>
> 创建`src/node.ts`文件，目前支持两种风格的插件编写
> 
> 1.函数形式，插件hook比较散，不易于聚合管理
> 
> ```js
> import { NodeHooks } from 'award-plugin';
> 
> // NodeHooks用来TS类型提示的
> // options是当前使用该插件传进来的参数
> export default (hooks: NodeHooks, options: any) => {
>   hooks.modifyContextAward(function(params){
> 		// 开始处理params
> 	})
> }
> ```
> 
> 2.对象形式，对插件功能做了聚合
> 
> ```js
> import Plugin from 'award-plugin';
> 
> export default class extends Plugin.Node{
>   apply(){
>     this.server(hooks=>{
>       hooks.modifyContextAward(function(params){
> 		    // 开始处理params
>         // 通过this.options来获取插件自定义配置的变量
> 	    })
>     })
>   }
> }
> ```

## server

### modifyContextAward 
修改ctx.award的变量结构，原则上只允许添加，不允许删除

| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |


### modifyInitialPropsCtx 

修改在服务端运行时，当执行`getInitialProps`函数时，处理该函数接收到的参数

| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |
| params  | 服务端默认传递的参数内容  | object |

### willCache 

在服务端处理缓存之前，触发该函数


| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |

### willFetch 

在服务器获取数据之前，触发该函数

| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |


### didFetch 

在服务端获取完数据之后，触发该函数

| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |

### beforeCoreMiddlewares 

在award内部的核心中间件之前注入中间件的hook函数


| 参数        | 说明                             | 类型    |
| ----------- | -------------------------------- | ------- |
| middlewares | 存储中间件的数组结构，原型链操作 | Array   |
| config      | 当前项目的award配置              | object  |
| port        | 当前服务端口                     | string  |
| dev         | 当前配置运行环境，开发、生产     | boolean |

### afterCoreMiddlewares 

在award内部的核心中间件之后注入中间件的hook函数


| 参数        | 说明                             | 类型    |
| ----------- | -------------------------------- | ------- |
| middlewares | 存储中间件的数组结构，原型链操作 | Array   |
| config      | 当前项目的award配置              | object  |
| port        | 当前服务端口                     | string  |
| dev         | 当前配置运行环境，开发、生产     | boolean |

### beforeRender 

 award在服务端渲染之前，即在执行`renderToString`函数之前一行

 | 参数    | 说明                      | 类型   |
 | ------- | ------------------------- | ------ |
 | context | 服务端的`koa`的上下文对象 | object |

### render 

执行`renderToString`函数所接受的参数

 | 参数      | 说明                          | 类型          |
 | --------- | ----------------------------- | ------------- |
 | context   | 服务端的`koa`的上下文对象     | object        |
 | Component | renderToString接受的react组件 | React.Element |

### document

award在服务端渲染，或者在导出单页应用时，对document进行整理

```typescript
export interface Idocument {
  context: IContext;
  doc: {
    beforeHead: any;
    afterHead: any;
    beforeScript: any;
    afterScript: any;
    beforeHtml: any;
    afterHtml: any;
  };
}
```

 | 参数    | 说明                      | 类型          |
 | ------- | ------------------------- | ------------- |
 | context | 服务端的`koa`的上下文对象 | object        |
 | doc     | 文档结构对象              | Object        |
 |         | beforeHead                | React.Element |
 |         | afterHead                 | React.Element |
 |         | beforeScript              | React.Element |
 |         | afterScript               | React.Element |
 |         | beforeHtml                | React.Element |
 |         | afterHtml                 | React.Element |

```js
// 支持如下示例的使用策略
params.doc.beforeHead = <h1>hello 1</h1>
params.doc.beforeHead = () => <h1>hello 2</h1>

// 最终输出结果
<>
  <h1>hello 1</h1>
  <h1>hello 2</h1>
</>

// 即该钩子，会对原型链值的累加
```


### afterRender 

award在服务端渲染之后，即在执行`renderToString`函数之后一行

 | 参数    | 说明                                   | 类型   |
 | ------- | -------------------------------------- | ------ |
 | context | 服务端的`koa`的上下文对象              | object |
 | html    | `renderToString`执行后生成的html字符串 | string |

## build

### beforeBuild 

award项目执行`award build`构建命令之前

| 参数    | 说明                | 类型                             |
| ------- | ------------------- | -------------------------------- |
| run_env | 构建的环境类型      | 'node' 、 'web_ssr' 、 'web_spa' |
| config  | 当前项目的award配置 | object                           |

### source

处理编译后的静态资源

```typescript
export interface Isource {
  dir: string;
  dist: string;
}
```
| 参数 | 说明                           | 类型   |
| ---- | ------------------------------ | ------ |
| dir  | 当前项目根目录                 | string |
| dist | 当前静态资源输出文件的相对路径 | string |

### afterBuild 

award项目执行`award build`构建命令之后

| 参数    | 说明                | 类型                             |
| ------- | ------------------- | -------------------------------- |
| run_env | 构建的环境类型      | 'node' 、 'web_ssr' 、 'web_spa' |
| config  | 当前项目的award配置 | object                           |


## config

### webpackConfig 
 
处理webpack的配置文件

| 参数     | 说明                                              | 类型    |
| -------- | ------------------------------------------------- | ------- |
| config   | 当前系统内置的webpack配置                         | object  |
| isServer | 当前的配置是否应用服务端编译                      | boolean |
| isAward  | 表示当前是否编译award项目内文件，即非server端文件 | boolean |
| dir      | 当前项目的根目录                                  | string  |
| dev      | 当前配置运行环境，开发、生产                      | boolean |
| dll      | 表示当前的webpack配置是否应用于dll                | boolean |


### babelConfig `同步`

添加新的babel配置，该钩子只支持同步

| 参数        | 说明                         | 类型                                               |
| ----------- | ---------------------------- | -------------------------------------------------- |
| config      | 当前babel的配置结构          | object { plugins: Array<any>;presets: Array<any>;} |
| awardConfig | 当前系统内置的webpack配置    | object                                             |
| isServer    | 当前的配置是否应用服务端编译 | boolean                                            |
| dev         | 当前配置运行环境，开发、生产 | boolean                                            |

## compiler

### webpackCompiler 

处理webpack编译后的compiler

| 参数     | 说明                                              | 类型    |
| -------- | ------------------------------------------------- | ------- |
| compiler | webpack编译的对象结构                             | object  |
| config   | 当前系统内置的webpack配置                         | object  |
| isServer | 当前的配置是否应用服务端编译                      | boolean |
| isAward  | 表示当前是否编译award项目内文件，即非server端文件 | boolean |
| dir      | 当前项目的根目录                                  | string  |
| dev      | 当前配置运行环境，开发、生产                      | boolean |
| dll      | 表示当前的webpack的编译是否对dll进行编译          | boolean |






