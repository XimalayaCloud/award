---
id: intro
title: 介绍
original_id: intro
sidebar_label: 快速入门
---

**项目依赖安装，推荐使用[`yarn`](https://yarnpkg.com/zh-Hans/docs)**

**推荐使用[v12的Node版本](https://nodejs.org/en/)，提升开发体验**

## 快速体验

```sh
npm init award example

cd example

npm run dev
```

## 依赖说明

> 项目构建发布到生产环境时，不要安装`devDependencies`里面的依赖

### 运行包

**需要安装到`dependencies`**

```sh
yarn add award
```

### 工具包

**需要安装到`devDependencies`**

```sh
yarn add award-scripts -D
```


## 开始

> Award项目的`"main函数"`

1. 为服务端和客户端的应用程序启动，提供了统一的函数入口

2. 默认为根目录下的`index.(js|jsx|ts|tsx)`，同时可以通过配置文件`award.config.js`指定入口

```jsx
import { start } from 'award';

/**
 * 只执行一次。不会被覆盖，多次执行会警告提示
 * App            项目启动入口组件【根组件】
 * ErrorComponent 项目错误处理组件【错误组件】
 */
start(App, ErrorComponent);
```

## 重要概念

- **根组件**： `start`函数的第一个参数
- **错误组件**：`start`函数的第二个参数
- **路由组件**：`<Route component={Home}/>`上的`component`接收的组件
- **普通组件**：除了以上三种的所有组件

## 运行环境

**可以通过`process.env.RUN_ENV`来判断运行环境，如下示例**
```js
let value = null;
if(process.env.RUN_ENV === 'web'){
  // 仅客户端执行
  value = require('./xx.web.js')
}
if(process.env.RUN_ENV === 'node'){
  // 仅node端执行、webpack打包时会移除该段代码
  value = require('./xx.node.js')
}
```

## 功能一览

- 支持服务端渲染应用开发（ssr）、单页应用开发（spa）

- 推崇`react` · 组件 、 `koa` · 中间件的开发模式

- 内置`Code Spliting`，自动根据路由进行代码拆分

- 基于`react-router-dom`实现的路由逻辑，同时提供全局和局部的路由生命周期、路由数据缓存、路由loading等功能

- 内置了全局数据管理工具`setAward`、代码热更新和中间件热更新等功能

- 支持`TypeScript`、`mock`、`proxy`、`CSS Modules`等功能

- 支持在若干场景下，展示友好的错误页面
