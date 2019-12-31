# `Award` ∙ [![award versions](https://img.shields.io/npm/v/award.svg)](https://www.npmjs.com/package/award) [![CircleCI Status](https://circleci.com/gh/XimalayaCloud/award.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/XimalayaCloud/award) [![award mit](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/XimalayaCloud/award/blob/master/LICENSE) [![build pass](https://img.shields.io/circleci/build/github/XimalayaCloud/award/master.svg)](https://circleci.com/gh/XimalayaCloud/award)

[![codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/awardhello-world-0y1fi?fontsize=14&hidenavigation=1&theme=dark)

Award框架是一个渐进式的web应用框架

- **场景:** 基于react框架，支持单页应用和服务端渲染

- **开箱即用:** 基于react组件化思想，按需引入，内置了构建工具、热更新配置等

- **插件:** 提供了丰富的hook函数，旨在让Award框架的生态越来越繁荣

[Learn how to use Award in your own project](http://openact.ximalaya.com/award/docs/basic/intro/)

# Explain

- 借鉴了[next.js](https://github.com/zeit/next.js)的一小部分思想，以下功能都是区别于`next.js`，包括框架实现
- 结合[react-router](https://github.com/ReactTraining/react-router)实现了路由逻辑[`award-router`](http://openact.ximalaya.com/award/docs/router/intro/)，对前端路由的变化进行了精细化控制，[参考生命周期](http://openact.ximalaya.com/award/docs/router/intro/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)
- 内置了样式scope和按需加载，开发者只需要引用样式即可，[点击了解更多](http://openact.ximalaya.com/award/docs/basic/static/#%E6%A0%B7%E5%BC%8F)
- 提供了可自由扩展award功能的插件系统
- 提出了运行包和工具包的思想，极大的减少了，在node环境运行时，所需安装依赖的体积
- [更多功能，请查看文档进行探索](http://openact.ximalaya.com/award/docs/basic/intro/)

# Installation

```bash
$ yarn add award
```

# Documentation

详细文档介绍请[点击网站查看](http://openact.ximalaya.com/award/docs/basic/intro/)

整个文档有如下几个部分：

- [快速体验](http://openact.ximalaya.com/award/docs/basic/intro/)
- [配置文件](http://openact.ximalaya.com/award/docs/basic/config/)
- [命令介绍](http://openact.ximalaya.com/award/docs/basic/command/)
- [路由](http://openact.ximalaya.com/award/docs/router/intro/)
- [数据请求](http://openact.ximalaya.com/award/docs/router/intro/)
- [自定义server](http://openact.ximalaya.com/award/docs/basic/server/)
- [API说明](http://openact.ximalaya.com/award/docs/api/start/)
- [插件使用规则](http://openact.ximalaya.com/award/docs/plugin/intro/)
- [贡献指南](http://openact.ximalaya.com/award/docs/more/CONTRIBUTING/)

# Examples

```jsx
// 根目录创建index.js
import { start } from 'award';

function app() {
  return <div>Hello Award</div>;
}

function error({ status }){
  return <div>StatusCode {status}</div>;
}

start(app, error);
```

执行`award dev`命令启动上面这个示例，服务端将返回`<div>Hello Award</div>`的dom文档内容

如果上述示例在执行时出现了错误，那么将渲染`error组件`

# Contributing

我们的目的是继续增强和优化Award功能，为web应用开发提供更便捷的辅助手段。阅读以下内容来了解如何参与改进Award。

## [Contributing Guide](http://openact.ximalaya.com/award/docs/more/CONTRIBUTING/)

阅读我们提供的[贡献指南](http://openact.ximalaya.com/award/docs/more/CONTRIBUTING/)来了解我们的开发流程，以及如何提出错误修正和改进，包括Award版本的迭代规范和发布流程

## Testing

`yarn test:coverage --collectCoverageFrom="packages/award/src/**/*.{ts,tsx}"`

## License

Award is [MIT licensed](./LICENSE).


