# Award ∙ [![build pass](https://img.shields.io/circleci/build/github/XimalayaCloud/award/master.svg)](https://circleci.com/gh/XimalayaCloud/award)  [![coverage](https://img.shields.io/codecov/c/github/XimalayaCloud/award/master.svg)](https://codecov.io/github/XimalayaCloud/award?branch=master) [![award versions](https://img.shields.io/npm/v/award.svg)](https://www.npmjs.com/package/award) [![CircleCI Status](https://circleci.com/gh/XimalayaCloud/award.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/XimalayaCloud/award) [![award mit](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/XimalayaCloud/award/blob/master/LICENSE) 

[![codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/awardhello-world-0y1fi?fontsize=14&hidenavigation=1&theme=dark)

- **场景:** 基于react框架，支撑[大型内容网站](#faq)的服务端渲染和单页应用

- **开箱即用:** 开发者只需要关注组件和中间件的开发即可，其他就交给award吧

- **插件:** 提供了丰富且强大的插件系统，让开发者在Award的生态里自由的翱翔

[点击查看文档，学习如何使用award](http://openact.ximalaya.com/award/docs/basic/intro/)

[Award视频专栏](https://space.bilibili.com/353384906/channel/detail?cid=97973)

# Example

## Installation

```bash
$ yarn add award 
$ yarn add award-scripts -D
```
## Create `index.js`

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

执行`yarn award dev`命令启动上面这个示例，服务端将返回`<div>Hello Award</div>`的文档内容

如果上述示例在执行时出现了错误，那么将渲染`error组件`

# FAQ

<details>
  <summary>目前有哪些项目在使用award呢，我可以放心使用么？</summary>

> 喜马拉雅内部的服务端渲染项目都是使用award进行构建的，所以你不必担心框架的维护问题

- [喜马拉雅主站](https://www.ximalaya.com/)

- [喜马拉雅m站](https://m.ximalaya.com/)

- [喜马拉雅国际站](https://www.himalaya.com/)

- [喜马拉雅圈子](http://m.ximalaya.com/quanzi/9)

- [喜马拉雅广告投放](http://yingxiao.ximalaya.com/)

</details>

<details>
  <summary>award和next.js的区别是什么？</summary>

> award和[next.js](https://github.com/zeit/next.js)都是一个基于react的服务端渲染框架，假设你已经了解next.js框架了，接下来我们来说明award和next.js的区别

- 基于[react-router](https://github.com/ReactTraining/react-router)实现了[`award-router`](http://openact.ximalaya.com/award/docs/router/intro/)，其提供了更精细化的路由控制
  
  - 比如你可以定义`path="/:id(\\d+)"`来匹配全是数字的路由，对于强SEO需求的项目很有用处。请查看[react-router](https://github.com/ReactTraining/react-router)来了解path定义的规则

  - 你可以使用`award-router`提供的[路由生命周期](http://openact.ximalaya.com/award/docs/router/intro/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)来精细化控制前端的每次路由切换。比如用户离开当前路由时，可以使用自定义弹窗组件来确认是否离开

  - 支持自定义的嵌套路由，定义规则和`react-router`一致，使用上稍有差异，[点击查看](http://openact.ximalaya.com/award/docs/router/nestedRoute/)

  - 当然`next.js`关于路由的所有功能，我们也都是支持的

- 关于 CSS-in-JS ，[可以点击了解更多](http://openact.ximalaya.com/award/docs/basic/static/#%E6%A0%B7%E5%BC%8F)
  
  - 开发者只需要通过`import './style.scss'`的形式引用，即可实现 CSS-in-JS，且自动实现了样式scope和开发阶段的样式缓存
  
  - 无需任何配置，编译后即可将样式提取到css文件，且在生产环境运行时可以根据路由按需加载，包括服务端渲染直出时

  - `next.js`目前还需要一些配置来实现

- award提供了丰富且强大的插件系统，可以不断的给Award注入活力。`next.js`暂未表态其插件市场

- 提出了运行包和工具包的思想，极大的减少了，在node环境运行时，所需安装依赖的体积。`next.js`不支持

- award基于[koa](https://github.com/koajs/koa)，开发者可以通过写中间件自由扩展服务端能力

  - 开发阶段，我们支持中间件的热更新功能

  - `next.js`需要自行通过`koa`或者`express`再次封装一下，才能方便的使用中间件

- [更多功能，欢迎查看文档进行探索](http://openact.ximalaya.com/award/docs/basic/intro/)

</details>

<details>
  <summary>当开发服务端渲染项目时，我该选择award，还是next.js呢？</summary>

- 如果你的项目对SEO要求比较高，且是大型的服务端渲染项目，推荐使用`award`。其可以更好的帮你管理路由，管理中间件，管理样式的开发等

- 如果项目不是那么大，对SEO的要求不是很苛刻，那还是推荐使用`next.js`吧

- 两者各有优缺点，建议都使用下对比看看。整体的上手和学习成本，两者都差不多

</details>


# Contributing

我们的目的是继续增强和优化Award功能，为web应用开发提供更便捷的辅助手段。阅读以下内容来了解如何参与改进Award

## [Contributing Guide](http://openact.ximalaya.com/award/docs/more/CONTRIBUTING/)

阅读我们提供的[贡献指南](http://openact.ximalaya.com/award/docs/more/CONTRIBUTING/)来了解award的开发和发布流程

## Testing

你也可以通过运行测试脚本`yarn test:client`参与到award的开发中来

## License

Award is [MIT licensed](./LICENSE).


