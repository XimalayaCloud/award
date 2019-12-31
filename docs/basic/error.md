---
id: error
title: 友好错误解决方案
original_id: error
sidebar_label: 友好错误解决方案
---

## 声明

>  如果项目定义了路由，在发生错误后，错误组件将作为RouterSwitch的子组件进行渲染
> 
>  如果这次渲染出错，再次尝试只渲染错误组件
> 
>  如果再渲染出错，那么将展示系统提供的错误提示信息

## 指定友好错误显示组件

**start 函数的第二个参数，将接收展示错误友好内容的组件**

> 即如果定义了该组件，那么发生的所有错误将导向该组件，同时页面渲染也会渲染该组件

```js
import { start } from 'award';

const App = (props) => <h1>{props.a.c.c}</h1>;
const ErrorComponent = (error) => <p>error --- {error.status}</p>;

start(App, ErrorComponent);
```

## 错误码说明

### 404

- 用户访问地址为`/`的页面，永远也不会出现 404，因为这是默认的入口页面

  如果定义了`path="/"`就展示该组件，否则渲染`null`

- 用户访问地址非`/`的页面，且在路由的`path`中没有定义，那么就会执行 404 错误

### 500

- 服务端渲染模板出错，比如`props={}`，但是渲染时，需要展示`props.a.b.c`，就会出现 500 错误了

### 自定义

- 开发者可以通过`try{...}catch{...}`捕获错误，然后自定义错误码响应

  示例

  ```js
  //比如可以在getInitialProps函数里面抛出错误码
  App.getInitialProps = () => {
    throw { status: 400 };
  };
  ```

- `throw`的数据类型

  ```js
  error = {
    // 标识错误响应码
    status: Number,
    // 标识该错误展示的页面是否落在RouterSwitch内，默认为false
    routerError?: boolean;
    // 定义重定向的路由地址
    url?: string
  }
  ```

  > 如果 url 存在, 那么会进行重定向到该 url,相应的 status 为 301/302(默认)
  >
  > 可以利用这点做重定向,如下示例

  ```jsx
  // 执行 getInitialProps 后会重定向到 /error 路由去
  App.getInitialProps = () => {
    throw { url: '/error' };
  };
  ```
## 错误场景说明

### routerError

> 用来标识错误页面是否落盘到`RouterSwitch`组件内

1. 服务端执行时，默认为false
2. 当路由组件发生渲染，即触发渲染中间件时，且渲染逻辑执行到`RouterSwitch`组件内了，将`routerError`将设置为true
3. 如果该次路由组件渲染发生错误，将根据`routerError`为`true`来渲染错误页面
4. 如果这个时候，`RouterSwitch`组件外发生错误了，将被捕获，此时`routerError`将设置为false，因为确信此时是全局错误了，同时status将重置为500错误码
5. 接着会继续渲染该错误页面，如果错误页面也在某种情况下发生了错误，那么将由系统提供默认的错误提示

### 自定义中间件抛错

> 例如在配置文件中设置的app函数，来自定义中间件
>
> 又例如在server.js中定义的中间件亦是如此
> 
> 如果抛出了错误，且需要展示在`RouterSwitch`组件内，就必须进行如下抛错代码

```js
throw { status: 404, routerError: true }
```
  

### 你仍然需要保证错误不要蔓延

1. 可能在某些情况下，你强制将错误展示在`RouterSwitch`组件内，导致了组件外的渲染出错
2. 这个时候，系统还是会渲染一次全局错误，即还会将错误页面在全局重新渲染一遍
3. 如果最终错误组件发生了错误，那么将执行系统内置错误提示


### 开发环境

> 如果开发者没有指定`错误组件`，那么出现了错误，在开发环境会展示系统默认提示

<p style="height: 310px;">
  <img style="width:500px;height:300px" src="/award/docs/assets/error.png" align="left"/>
<p>

- **`award dev -i`**可以忽略系统默认提示

- **server.js**

  ```js
  const app = new Server({
    ignore: true,
  });
  ```

### 生产环境

> 如果没有指定`错误组件`，将不会出现上述默认错误
>
> 页面上将如下展示

<p style="height: 310px;">
  <img style="width:500px;height:300px" src="/award/docs/assets/prod-error.png" align="left"/>
<p>

## 错误组件高级用法

错误组件也具有 getInitialProps 方法

具有以下特点:

1. 可以拉取请求数据, 拉取到的数据会放到 error.data 中, 然后 error 对象作为 props 传到 ErrorComponent 去
2. throw error 对象, 但不能进行重定向
3. ctx.loading = Component, 设置 ErrorComponent getInitialProps 时的 loading

```jsx
// 错误展示组件
// 支持getInitialProps方法，进行初始化数据
export default class ErrorComponent extends React.Component {
  static async getInitialProps(ctx) {
    ctx.loading = () => <h1>加载中...</h1>;
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    return {
      name: Math.random(),
    };
  }

  render() {
    const { status, routerError, data } = this.props;
    if (status === 404) {
      return <Show404 />;
    }

    if (status === 500) {
      return (
        <div>
          <h1 className="stack">500页面 --- {data.name}</h1>
          {!routerError ? (
            <Link to="/ok">全局发生错误，点击回到正常页面</Link>
          ) : null}
        </div>
      );
    }

    return null;
  }
}
```
