# `Award`

Award框架是一个渐进式的web应用框架

- **场景:** 基于react框架，支持单页应用和服务端渲染

- **开箱即用:** 基于react组件化思想，按需引入，内置了构建工具、热更新配置等

- **插件:** 提供了丰富的hook函数，旨在让Award框架的生态越来越繁荣

[Learn how to use Award in your own project](http://openact.ximalaya.com/award/docs/basic/intro/)

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
