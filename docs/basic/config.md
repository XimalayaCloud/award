---
id: config
title: 配置说明
original_id: config
sidebar_label: 配置文件
---

> 项目根目录创建`award.config.js`配置文件，该文件仅会在`node端执行`、支持`es6`语法

## 示例

**award.config.js**

```js
module.exports = {
  entry: './index.js'
};

// OR

export default {
  entry: './index.js'
};
```

## 默认配置

```js
export default {
  entry: './index',         // 项目入口
  assetPrefixs: '/static/', // 静态资源地址
  app: (middlewares: Middleware[]) => Middleware[], // 自由扩展中间件
  basename: '',      // 路由前缀  
  mode: 'server',    // 指定渲染类型，默认为服务端渲染,  ['server','client']
  router: 'browser', // 指定路由类型，默认为browser, ['hash','browser']
  hashName: true,    // 指定导出项目的入口静态资源名字是否开启hash，默认开启hash
  crossOrigin: true, // 设置资源请求是否跨域
  proxyTable: {},    // 设置接口代理
  fetch: {           // 配置在服务端请求时，需要添加的host    
    domainMap: {},
  },
  exportPath: null,  // 指定导出某个路由path的html
  webpack(config, options) { // 自定义扩展webpack配置 
    return config;
  },
  plugins: []       // 指定使用的插件名称
};
```

## 字段说明

### `entry` 项目入口

**自定义指定项目入口**

> 默认入口为**`index.(js|jsx|ts|tsx)`**

### `assetPrefixs` 静态资源前缀

- 配置资源地址前缀，如果不是以`http`开头，那么系统在发布阶段会创建以`assetPrefixs`开头的资源访问地址

- 如果是`http`开头，且如果需要做对应的`cdn`需要做地址资源映射，那么就需要自己新建静态资源中间件了，如下示例

  ```js
  const mount = require('koa-mount');
  const static = require('koa-static');
  const Koa = require('koa');
  const app = new Koa();
  module.exports = {
    // 最后一定要斜杠结尾
    assetPrefixs: 'http://cdn.com/project/static/', 
    app: (middlewares) => {
      const source = mount('/static', app.use(static('./dist')));
      middlewares.unshift(source);
    },
  };
  ```

- 通常我们会根据环境来指定不同的`assetPrefixs`地址


### `app` 处理核心中间件

> 对Award内`核心的中间件`进行再处理，可用于自定义中间件、实现缓存、数据处理等功能
>
> 对于`非核心中间件`的使用，[请点击查看更多关于中间件的扩展使用](server#中间件)

**示例**

```js
app: (middlewares) => {
  const cache = async (ctx, next) => {
    // 根据您的业务逻辑决定是否开启cache
    // 通常用来判断是否是登录用户
    // 我们往往对于登录用户采取纯客户端渲染
    // 非登录用户通过服务端渲染 + 静态html缓存来达到最优体验的目的
    ctx.award.cache = true;
    await next();
  };
  // 插入缓存中间件之前
  middlewares.splice(0, 0, cache);
};
```

**说明**

> middlewares 是一个系统内置的中间件数组
>
> 开发阶段支持热更新，直接修改中间件代码，刷新页面即可查看逻辑执行结果

```
middlewares = ['缓存处理中间件','接口处理中间件','渲染页面中间件']
```

- **缓存处理中间件**：判断`ctx.award.cache`值来决定是否读取缓存内容
- **接口处理中间件**：根据匹配到的地址解析其对应接口数据的中间件，并将获取到的数据存放到`ctx.award.initialState`中
- **渲染页面中间件**：根据接口数据、匹配组件渲染出html的中间件，html内容存放在`ctx.award.html`中

> 支持路径引入，以及自定义返回中间件（即无需通过`splice`来操作原型了）
>
> 配置文件支持 es6 语法了，包括配置文件引用的依赖都是支持的

```js
// 示例
import midd from './midd';
export default {
  app(middlewares) {
    return [midd, ...middlewares];
  },
};
```

### `basename` 路由地址前缀

设置当前项目发布后的访问地址前缀，比如发布到`www.example.com/project-a`下，那么`/project-a`就是该项目的basename


### `mode` 渲染类型

```json
{
  "mode": "可选值"
}
```

| 可选值 | 说明                                 | 类型   | 默认 |
| ------ | ------------------------------------ | ------ | ---- |
| server | 服务端渲染                           | string | ✔️   |
| client | 服务端`不再`提供渲染能力，即单页应用 | string |      |

### `router` 路由类型

```json
{
  "router": "可选值"
}
```

| 可选值  | 说明                                                                     | 类型   | 默认 |
| ------- | ------------------------------------------------------------------------ | ------ | ---- |
| browser | HTML5 History 模式，没有`#`。服务端是否渲染需要根据`mode`值来判断        | string | ✔️   |
| hash    | hash 模式，即带`#`。服务端也将不会渲染，服务端不处理 hash 形式的路由地址 | string |      |

### `hashName` 文件名称

当执行导出命名时，指定入口的资源文件是否进行 hash，只接受`true`或者`false`，默认为`true`

**入口静态资源，即配置项 `hashName`**

- `hashName = true`

  入口静态资源的名称会根据文件内容进行 hash 处理，文件名称会根据内容进行变化

- `hashName = false`

  入口静态资源文件名称固定，默认有下面几种文件类型

  - js

    `common.js` - 当前项目公共的 js 资源

    `manifest.js` - 存储当前项目变化的 js 资源

    `main.js` - 当前项目的主入口 js 文件

  - css

    `main.css` - 当前项目公共的样式资源

  其余的 chunk 文件仍然是`hash`名称，主要通过代码拆分进行按需加载

  使用场景，当进行样式微小变化的时候，可以直接发布静态资源

### `crossOrigin` 是否跨域

默认值为 true, 讲会在 script 标签设置 crossOrigin 属性为 anonymous, 当 script 标签请求跨站脚本的时候不会通过 cookies，客户端 SSL 证书或 HTTP 认证交换用户凭据。

更多信息查看 [CORS_settings_attributes](https://developer.mozilla.org/zh-CN/docs/Web/HTML/CORS_settings_attributes)

### `proxyTable` 代理配置

设置接口代码，例子如下

配置规则参考[`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware)

```json
{
  "proxyTable": {
    "/api": {
      "target": "http://127.0.0.1:2891/",
      "changeOrigin": true
    }
  }
}
```

### `fetch` node 请求配置

node 端需要拼接 URL, 所以需要 fetch 字段来做域名映射,
如下的配置是 award 内部的默认配置, 当 node 端请求如 `/api/getUser` 这类接口, 会拼接上下面定义的`http://localhost:1234`, 形成 `http://localhost:1234/api/getUser`, 这样请求在 node 端就能被正确的处理了

```json
{
  "fetch": {
    "domainMap": {
      // domain映射
      // "api":"localhost"
      "api": "http://localhost:1234"
    },
    "apiGateway": {}
  }
}
```

> 下面将介绍下`domainMap`

如果你的项目是`ssr`，即`mode:"server"`，需要配置domain，又或者你需要配置mock时，也需要指定domainMap

> 说明：由于在服务器上请求接口时，需要拼接全地址
> 
> 所以这里需要指定请求地址的前面的path来作为`domainMap`的key
>
> key对应的value就是以该path为开头的请求地址，都将使用该url来进行拼接

#### 示例

现在有两个请求地址`/api/a/b`和`/api/c/d`

如果
>`/api/a`开头的地址映射到`http://a.com`
>
>`/api/c`开头的地址映射到`http://c.com`

那么`fetch`的`domainMap`需要进行如下配置

```json
// award.config.js
export default {
  "fetch":{
    "domainMap":{
      "/api/a": "http://a.com",
      "/api/c": "http://c.com"
    }
  }
}
```

#### 注意

> 1. `domainMap`指定的地址value后面不要带斜杠，因为斜杠你已经在请求url上设置了
>
>    `fetch('/api/a')`，最终会拼接成全地址`http://a.com/api/a`，然后在node服务器上发起接口请求
>
> 2. 当然一般使用mock的话，都是配置本地地址，即`/api/a`、`/api/c`的地址都是`http://localhost:你的端口号`
>
> 3. 但是如果在测试环境或者uat、生产环境运行时，当前在服务端执行请求时，还是会到这里找map，拼接出完整的url的
>
>    所以一般你需要通过环境变量来控制`domainMap`的值


> 下面将介绍下`apiGateway`

`apiGateway`是一种服务器内网请求接口的一种形式，通过`zookeeper`工具，提取ip，最后以ip的形式在内网进行接口调用

**关于这里的配置需要联系网关同学进行协调处理**

```json
apiGateway: {
  "API_RETRY_TIME": 1,  // 通过zk获取ip地址失败后尝试次数
  "API_APIGATEWAY_OPEN": false, //是否开启apiGateway
  "INNER_SOUTHGATE": "127.0.0.1:7000",  //source gateway的ip地址集
  "digestAuth":"" // zookeeper的权限密码，没有可以不填
},
```

### `exportPath` 指定导出 path 的 html

> 1. `exportPath`默认为 null，默认导出的时候主体的 html 内容为空
> 2. 接收对象结构，导出多个 html 文件
>
>    需要注意，如果路由从`/`切换到`/about/3`时，对于单页应用，当前页面的 html 不会刷新变化，如果在`/about/3`页面刷新，页面会出现布局闪烁
>
>    为了让切换后，刷新也是当前的`about.html`这个文件的结构，你需要在执行`award export`命令时，添加`--html`

```js
/**
 * 最终会导出3个html文件
 */
{
  exportPath: {
    /**
     * key为导出的文件名称
     * value为当前文件的默认路由地址 
     */
    "index.html": "/",
    "about.html": "/about/3",
    "detail.html": "/detail/10",
  }
}
```

### `webpack`扩展 webpack 配置

> ⚠️ 必读 ⚠️，在使用该配置项时，请不要对rules进行任何修改和添加操作，如果确实有需求，请通过插件的形式来处理修改rules这种需求
>
> 请注意，该方法只会在编译阶段执行

`webpack`字段是一个函数，接收两个参数，同时需要返回新的 config

```js
export default {
  webpack(config, options) {
    return config;
  },
};
```

| 参数    | 说明                                                                                          | 类型   |
| ------- | --------------------------------------------------------------------------------------------- | ------ |
| config  | 框架提供的 webpack 配置对象                                                                   | object |
| options | 框架提供的可供配置的参数，因为不同环境下的编译配置文件是不一样的，可以根据 options 来判断出来 | object |

> ```
> // options结构
> options: {
>   isServer: boolean; // 判断是否是node端的配置文件  node端为true、否则为false
>   isAward: boolean;  // 标识当前执行编译的文件是否是award项目入口展开的，可以用来区分纯node项目编译和award项目编译
>   dir: string;       // 当前项目的根目录地址
>   dev: boolean;      // 判断当前配置是否是开发环境、还是生产环境 开发环境为true、其他为false
> }
> ```

**示例**

> 你可以自定义环境变量来区分不同环境下运行的逻辑

**award.config.js**

```js
export default {
  webpack(config) {
    // 这个回调函数只会在编译阶段执行，所以与之相关的依赖引用也只能写在函数内部了
    // 千万不能写到函数外
    // 因为生产环境只会安装dependencies里面的依赖
    // 而像编译用到的依赖都是在devDependencies里面的
    const webpack = require('webpack');
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          MY_ENV: `'${process.env.MY_ENV}'`,
        },
      }),
    );
    return config;
  },
};
```

**你的 js 代码文件**

```js
let name = 'no xm_env';

// 根据不同的环境显示不同的内容
if (process.env.MY_ENV === 'test') {
  name = 'test';
} else if (process.env.MY_ENV === 'prod') {
  name = 'prod';
} else if (process.env.MY_ENV === 'dev') {
  name = 'dev';
}
```
