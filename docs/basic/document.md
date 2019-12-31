---
id: document
title: DOM文档组件
original_id: document
sidebar_label: DOM文档组件
---

## html文档，类似index.html

> 如果你需要扩展html文档，比如添加自定义脚本标签等等，那么你需要阅读下面内容

**在根目录创建`document.js`文件，其需要通过`export default`导出一个react组件，作为服务端渲染或者单页应用引用的模板组件**

> 可以通过在`document.js`内自定义html文档上其他的节点元素

## 示例
```jsx
// document.js
export default class extends React.Component {
  render() {
    // 这是Award核心内容
    const { Head, Html, Script } = this.props;
    return (
      <html>
        <head>
          <Head />
        </head>
        <body>
          <Html />
          {/* 可以自定义添加你的代码 */}
          <Script />
        </body>
      </html>
    );
  }
}
```


## 接收的props说明

| props          | 说明                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| `Head`         | ⭐️ Award内部整理的头部资源，包括css资源地址、组件内的头部标签等                             |
| `Html`         | ⭐️ Award内部渲染出来的dom文档，这里是服务端渲染出的html字符串，`Html`是包含html字符串的组件 |
| `Script`       | ⭐️ Award内部整理的脚本片段，包括需要加载的js资源等一些内置的js全局环境变量                  |
| `assetPrefixs` | 定义在`award.config.js`里面的`assetPrefixs`，注意：这里不能通过`require('./award.config.js')`来获取assetPrefixs                                              |
| `context`      | 表示当前请求的上下文对象，同时award相关环境参数都存储在`context.award`内                    |

> ⚠️ 在使用自定义document组件时，不能丢失Award框架内提供的props渲染，否则会导致页面主体内容丢失
>
> 即上面打⭐️的都是必须添加的，否则服务端渲染的内容会丢失，会造成不可挽回的错误


## 总结

- `document.js`可以理解为一个模板, 用来包裹住我们的组件的html, 然后生成一个完整的页面.

- 在`document.js`中我们可以自由写如一些script标签来完成一些在react项目内部不方便做的事, 例如谷歌统计代码, sdk资源引用等
