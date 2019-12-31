---
id: data
title: 数据获取和管理
original_id: data
sidebar_label: 数据获取和管理
---

## 数据获取

在服务端渲染以及客户端路由切换场景下，用户的每次操作都伴随数据的获取，我们为开发者提供了`getInitialProps`静态函数，统一处理这两种场景下的数据加载

> 也就是说，开发者无需在`componentDidMount`、`componentDidUpdate`、`componentWillReceiveProps`等生命周期获取数据了


### fetch

安装`award`后即可使用`award-fetch`这个库，其内部兼容了服务端渲染、客户端场景下的**[路由组件](intro#重要概念)**和**[根组件](intro#重要概念)**的数据请求处理

> 区别于浏览器自带的fetch函数，请务必注意，否则服务端无法正常发起请求

```js
import fetch from 'award-fetch';

/**
 * options = {
 *  method: 'POST',
 *  data: {
 *   id
 *  }
 *  // 等其他一系列参数
 * }
 */
fetch('/api/home/list', options);
```

> [点击查看更多关于fetch API的使用细节](/award/docs/api/award-fetch)

### 服务端请求说明

由于服务端在请求时，需要指定请求的全地址（包括协议、host、端口），那么开发者需要在[`award.config.js`中配置字段`fetch`](config#fetch-node-请求配置)

```js
// award.config.js
export default {
  fetch: {
    domainMap: {
      // 意思是，已/api开头的fetch请求会自动带上http://localhost:1234/这个域名地址
      // 主要是因为node端是服务器，不会自动加上协议域名，需要自行配置
      api: 'http://localhost:1234/',
    },
  },
};
```

### 组件示例

> ⚠️ 注意，这里的组件表示为[根组件](intro#重要概念)和[路由组件](intro#重要概念)  

**函数组件**
```jsx
// 假设这是一个路由组件
const App = (props) => <h1>{props.name}</h1>;

// 定义静态方法 getInitialProps
/**
 * 该方法返回值将作为该组件的props传给当前路由组件
 * 所以路由组件可以通过props.name来获取
 *
 */
App.getInitialProps = (ctx) => {
  return {
    name: 'hello',
  };
};
```

**class组件**
```jsx
class App extends React.Component{
  static getInitialProps(ctx){
    return {
       name: 'hello',
    };
  }

  render(){
    return <h1>{props.name}</h1>;
  }
}
```

## 数据管理

> Award内部围绕`getInitialProps`函数提供了一些数据管理的方法

### setAward

`setAward`是`award`内置的一个迷你数据管理, 方便解决数据复杂度不大, 业务逻辑相对简单的场景的数据管理需求

> `根组件.getInitialProps()`函数执行后返回的数据存入store, 同时请注意只有根组件(入口组件) 才会这样
>
> ⚠️ 1. 不要在render函数中进行执行setAward函数, 不然可能会导致一直渲染, 因为setAward改变的数据是一个全局store
>
> ⚠️ 2. `getInitialProps`函数内执行的setAward函数，必须是上下文传递的函数，示例`getInitialProps(ctx){ctx.setAward()}`

```jsx
import { setAward, removeAward, Consumer } from 'award';

// store 中写入 name 字段
setAward({ name: Math.random() });

...

// 使用 Consumer 获得全局 store
<Consumer>
  {(store) => {
    console.log('the global store: ', store);
    return <YourComponent />;
  }}
</Consumer>

...

// 删除 name 字段
removeAward('name');

...
```


### updateProps

在服务端渲染场景下，首次刷新浏览器加载页面后，通过该钩子`updateProps`来确认当前页面的数据是否需要更新

> 主要场景：登录用户首次访问站点时，访问的是无状态（不对登录信息做校验）的页面，那么在客户端渲染后，需要对数据重新更新
> 
> ⚠️ 1. `updateProps`必须挂载在根组件下才能生效，作为其静态参数，如下示例
>
> ⚠️ 2. 通常我们会在服务端通过缓存工具缓存无状态的html页面，在客户端可以通过该函数来判断是否是登录用户，然后再确定是否需要刷新数据

```jsx

// class
class App extends React.Component{

  // 直接设置true，将对所有情况进行数据更新操作
  static updateProps = true;

  // 支持函数，支持异步函数
  static updateProps = (data) => {
    // data是标识当前需要更新组件已有的数据，包括访问地址等一些路由信息
    // 开发者可以根据需求来确认是否需要更新数据
    // 比如，可以在这里拿到cookie，做用户登录校验的判断等等

    // 返回true，标识当前的访问需要更新数据
    return true;
  }

  render(){
    ....
  }
}

// Function
const  App = () => <h1>hello world</h1>

// 使用策略和上述一致
App.updateProps = true;

App.updateProps = (data) => {
  return true
}

```

### reloadInitialProps

> 现在每个可以使用`getInitialProps`的组件（即根组件和路由组件）都可以通过`this.props.reloadInitialProps()`函数来手动触发更新该组件的数据

> 比如用户登录后无需刷新页面即可完成页面数据更新的功能

**示例**

```jsx
class App extends React.Component{
  static getInitialProps(){
    return {
      name: Math.random();
    }
  }

  render(){
    // 点击执行reloadInitialProps函数，实际执行的是当前组件的getInitialProps方法
    // 可以看到name发生变化了
    return <p onClick={this.props.reloadInitialProps}>{this.props.name}</p>
  }
}
```