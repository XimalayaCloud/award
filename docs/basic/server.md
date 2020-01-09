---
id: server
title: 自定义server服务
original_id: server
sidebar_label: 自定义server服务
---

## 开始

`Award`提供的基于`API`形式的启动服务，区别于命令行形式

**server.js**
```js
const Server = require('award/server');

// 实例化，获取app，构造函数接收对象
const app = new Server({
  ...
});

// 监听端口
app.listen(3000);
```

### 开发

>需添加`dev`参数

```sh
# 内置了mock
$ node server.js dev
```

### 断点调试
> **⚠️ `vscode`需要进行如下设置**

1. 项目根目录创建`.vscode`文件夹，这个是vscode的配置文件所在的文件夹
2. 在`.vscode`创建`settings.json`文件
  
   ```json
   // settings.json文件内容
   {
     "debug.node.autoAttach": "on",
   }
   ```
3. 比如执行`award-debug dev`命令，即可开启`vscode`的断点调试了

```sh
$ node server.js debug
```

### 生产启动

```sh
$ node server.js
```

## `Server`构造函数参数说明

| 参数    | 说明                                                         | 类型    | 默认值 |
| ------- | ------------------------------------------------------------ | ------- | ------ |
| isProxy | 标识是否启用proxy获取数据                                    | boolean | false  |
| port    | 指定当前服务器的端口号                                       | number  | 1234   |
| ignore  | 忽略显示系统默认错误，仅在开发环境生效，主要用于错误页面开发 | boolean | false  |

## 中间件

> 通过`app.core()`区分了，award核心中间件执行之前和之后进行自定义中间件的添加
>
> `app.use`接收`koa`形式的中间件写法，同时也接受引用相对地址
>
> 通过相对地址的引用，award内部可以对其实现热更新

```js
...

// 这种引用，不会热更新，需要重启服务
app.use(async (ctx, next) => {
  console.log('start', ctx.path);
  await next();
});

// 当use引用相对地址文件，或者数组的时候，开发模式会对中间件热更新
app.use('./middleware.js');

// 一旦执行了app.core()
// 那么其代码后面use引用的中间件，将会在Award核心中间件执行完触发
app.core();

// 也可以是数组形式的多个文件引用
app.use(['./middleware.js']);

// 引用的文件模块，支持返回数组形式的中间件，也可以单独导出中间件
app.use('./a.js');

// a.js内容如下
module.exports = [mid1, mid2];

// OR
module.exports = mid1;


...
```

## 日志过滤

> 自定义过滤字段来禁用`console.log`的打印
> 
> 如果没有设置过滤器，award会禁用服务端所有的`console.log`的输出

```js

...

// 过滤器，仅在生产环境生效
// 通过过滤器，过滤出需要打印的日志
// 最后一个参数是option对象，表示该过滤的关键词是否需要打印出来
// 设置为false，就不会打印出来，默认是true
app.logFilter('show', 'test', {
  test: false,
});

app.use(async (ctx, next) => {
  await next();
  if (ctx.award) {
    const url = ctx.request.url;
    console.log(
      'show',
      `[user-agent]${url}: ${ctx.request.headers['user-agent']}`,
    );
    console.log('show', 'test', `[host]${url}: ${ctx.request.headers.host}`);
    console.log('show', '[renderTime]' + url, ctx.renderTime);
    console.log('test', '[responseTime]' + url, ctx.responseTime);
  }
});

...
```

## 自动打开Chrome

> 如果没有做任何设置，启动服务后，award内部会自动打开Chrome浏览器
>
> 同时会访问指定的端口，如果需要打开自定义的页面怎么处理呢？

通过`app.listen`第二个参数，执行回调，通过`open`打开浏览器

```js
// node server.js dev
const Server  = require('award/server');

const app = new Server();

app.listen(1234, (listen, url, open) => {
  open('http://dev.example.com:1234/');
});
```

## 终极错误捕获及自定义处理

>  这里统一处理node服务端的每次产生的错误，即这个地方就是node服务的错误边界

- 开发者可以根据node产生的错误进行自定义过滤出来
- 回调参数的error对象数据仅生产环境生效
- 如果没有将errLogs返回，那么将不会打印错误日志

```js
...

app.catch((errLogs)=>{
  // 处理errLogs是否落盘逻辑，对errLogs的字段进行判断处理
  // 根据业务需求，确认是否需要需要返回errLogs，将errLogs落盘到日志
  // 如果不需要落盘日志，可以不返回，或者返回null
  return errLogs
})

...
```