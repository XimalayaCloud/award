---
id: intro
title: 介绍
original_id: intro
sidebar_label: 介绍
---

**使用之前，请务必阅读[`说明`](#说明)和[`注意`](#注意)**

## 说明

> 框架已内置根据路由进行代码拆分，实现按需加载
>
> 前提条件是，该路由的组件必须是单独`import`进来的
> 
> **`即每个路由对应一个import引用模块`**
>
> #### 示例
>```js
> import Home from './page/home';
> import About from './page/about';
> ...
> <RouterSwitch>
>   <Route path="/home" component={Home}/>
>   <Route path="/about" component={About}/>
> </RouterSwitch>
> ... 
>```

> #### 下面这个示例，将不能实现路由的按需加载
>```js
> import { Home, About } from './page';
> 
> ...
> <RouterSwitch>
>   <Route path="/home" component={Home}/>
>   <Route path="/about" component={About}/>
> </RouterSwitch>
> ... 
>```

## 注意

上面我们看到的`RouterSwitch`和`Route`组件都没有实际上的意义，意思就是他们是用来定义路由的一种规范

当我们在使用`vue`定义路由时，需要提供路由的json配置，当需要配置父子路由嵌套时，json的表现不是很直观形象

所以我们这边就用组件来代替了，如下示例规范

```jsx
// 为了统一管理站点路由信息，我们通常会把路由集中到一个js文件进行管理
// 即js组件，请注意这里的组件不支持拆分引用，具体请看下面路由导入注意细节

// 创建routes.js，不处理任何props以及内部的state
// 其是一个无状态的组件
export default () => (
  <RouterSwitch>
    <Route path="/" component={Index} exact/>
    <Route path="/home" component={Home}/>
      <Route path="/home/:id" component={HomeContent} exact/>
    </Route>
  </RouterSwitch>
)

// 其实你可以理解为如下的json，但是为了便于理解组件嵌套和渲染关系，我们只提供组件的写法
// 如下示例进行对比参考
[{
  path:"/",
  component:Index,
  exact:true,  
},{
  path:"/home",
  component:Home,
  children:[
    path:"/home/:id",
    component: HomeContent,
    exact:true,
  ]
}]
```

> 其实对于一个熟练使用react的开发者来说，使用组件来表达路由的意思会比较容易理解
>
> 最后再申明一下，路由的定义组件不能拆分（即组件不能分离）、路由`routes.js`的组件内不支持任何数据处理
>
> 其只是用来当做路由定义使用的，**`纯展示组件`**

## 路由导入

```jsx
import {
  RouterSwitch,
  Route,  
  history
} from 'award-router';
```

其余API都要从`react-router-dom`获取

**示例**

```js
// 常用API
import { Link, NavLink, withRouter} from 'react-router-dom'
```
> 请不要使用`HashRouter`、`BrowserRouter`、`Switch`这些API
>
> `Route`组件仅在`RouterSwitch`组件下有意义，示例

### 🎉 有意义

```jsx
<RouterSwitch>
  <Route />
</RouterSwitch>
```

### ☠️ 无意义

```jsx
// routes
export default () => <Route />;
```

```jsx
import Routes from './routes';
<RouterSwitch>
  <Routes />
</RouterSwitch>;
```

## 路由定义

```jsx
<RouterSwitch>
  <Route path="/" component={() => null} redirect="/home" exact />
  <Route path="/user/:id" component={User}>
    <Route path="/user/:id/post/:postId" component={UserPost} exact />
    <Route path="/user/:id/profile" component={UserProfile} exact />
  </Route>
  <Route path="/test" component={Test} />
  <Route path="/about" component={About} exact />
  <Route path="/home" component={Home} exact />
  <RouterSwitch path="/404" component={() => <h1>404!</h1>} exact />
  <Route redirect="/404" />
</RouterSwitch>
```

## 路由匹配规则

从上到下进行匹配, 如果 match 到就返回, 否则一直 match 下去, 直到遍历所有路由. 所以更具体的路由应该放到前面去

> 空路由总是匹配 `<Route />`

## Route 属性(props)

| 参数     | 说明                                         | 类型                     | 默认值 |
| -------- | -------------------------------------------- | ------------------------ | ------ |
| loading  | 关闭动画结束后触发的回调函数                 | ReactElement             | -      |
| redirect | 重定向                                       | (() => string) or string | -      |
| sync     | 是否是同步组件,用同步的方式加载,否则默认异步 | boolean                  | false  |
| client   | 表示该路由组件是否只在客户端渲染             | boolean                  | false  |


> 其他 route 属性参考 [react-route 官方文档](https://reacttraining.com/react-router/web/api/Route)
>
> - **loading**
> 
>   如果路由的props指定了loading组件, 那么在客户端路由切换时会发生如下事情
> 
>   如果目标路由的数据没有缓存，将优先加载loading组件；如果发现有缓存，将不再显示loading组件，而是直接使用缓存的数据进行路由组件的渲染
> 
>   路由切换完成再去执行`getInitialProps`来获取数据，接着更新缓存和渲染当前路由组件

## 路由数据

> Award会分析匹配到的路由所对应的组件，然后执行组件上的静态方法`getInitialProps`，将执行的返回值，作为该路由组件的props来进行渲染

```js
// 示例
class Home extends React.Component{

  static getInitialProps(ctx){
    // 支持异步，接受ctx参数，具体参考api介绍
    return {
      name:'hello'
    }
  }

  render(){
    // 这里的props值来自getInitialProps函数的返回值
    return (
      <div>
        <p>{this.props.name}</p>
      </div>
    )
  }
}
```

## loading 逻辑

1. 如果切换的目标路由设置了 loading 组件，那么此次切换，会执行 bundle.js 的获取和 loading 组件的渲染，最后再 DidMount 的时候获取数据
2. 如果切换的目录没有设置 loading 组件，那么此次切换，会执行 bundle.js 获取和目标页面的数据获取，最后切换过去的页面会完整渲染出来
3. 如果数据已经获取过（即已经缓存）, 或者路由组件光有 loading 没有 getInitialProps, 那么 loading 是不会出来的, 会直接渲染组件
4. loading 出来的时间点 和 getInitialProps 执行完成的时长有关, 如果 getInitialProps 很快执行完了, 那 loading 可能都来不及肉眼发现


## 关于缓存说明

> Award内部会根据当前访问的详细地址进行缓存，目前会缓存最近的8个不同地址对应的数据
>
> 通过该缓存机制，用户在返回上一次的访问页面时，体验将会非常棒
> 
> 特别是对于一些tab类型的页面，在用户点击多个tab后，再来回点击时，用户体验也是非常好的，请点击站点进行体验[https://m.ximalaya.com/](https://m.ximalaya.com/)

## 嵌套路由

> 嵌套路由的父子路由之间是数据是隔离的,即父组件的数据是无法传递给子组件的
> 
> 如果想进行通信可以使用状态管理工具，比如[`setAward`](../basic/data#setaward)、`React.createContext`等类似redux的工具


## 生命周期

`Award`提供了路由生命周期钩子，方便开发者在路由切换前、切换后做一些业务处理，先对生命周期钩子函数接收的参数进行说明

| 参数 | 说明                       | 类型     |
| ---- | -------------------------- | -------- |
| to   | 表示目标路由的对象集合     | Object   |
| from | 表示切换路由的当前对象集合 | Object   |
| next | 确认是否进行下一步操作     | Function |
| data | 当前缓存的所有数据集合     | Object   |

- `next`，必须执行该方法，否则将不能进行后续操作

  - `next(boolean)`，顾名思义，即可确认是否需要阻止路由切换
  - `next(string)`， 接收路由地址，内部会自动进行路由跳转
  - `next()`，不传值，默认是 true
  - `next(<Confirm />)`，react 组件，仅`routeWillLeave`支持

    自定义的`Confirm`组件接收将默认接收如下 props，示例如下

    ```jsx
    class Confirm extends React.Component {
      render() {
        const { stop, pass, to, from, data } = this.props;
        return (
          <div>
            <p>确认是否离开当前页面？</p>
            <button onClick={() => stop()}>取消</button>
            <button onClick={() => pass()}>离开</button>
          </div>
        );
      }
    }
    ```

### `routeWillLeave`

> 每个`路由组件`都具备该静态钩子函数
>
> 当该组件对应的具体路由离开时，即触发
>
> 示例
>
> - `/a` 切换到 `/b`，`/a`对应的路由组件触发
> - 动态路由`/a/:id`，从`/a/1`切换到`/a/2`，则`/a/:id`对应的路由组件触发
> - `/a/b` 切换到 `/a`， `/b`对应的路由组件触发
> - 💅 `/a` 切换到 `/a/b`，则`不会`触发任何路由组件的 routeWillLeave 钩子
>
> ```js
> static routeWillLeave(to, from, next, data){
>
> }
> ```

### `routeDidUpdate`

> 该钩子函数定义在`路由组件`
>
> 即当前组件在创建后或发生更新后都会触发当前组件定义的静态函数`routeDidUpdate`
>
> ```js
> static routeDidUpdate(to, from, data){
>
> }
> ```


### `routerWillUpdate`

> 该钩子函数定义在`根组件`上，即入口组件
>
> 客户端路由进行切换，且通过了`routeWillLeave`钩子后，会立即触发全局的`routerWillUpdate`钩子
>
> ```js
> static routerWillUpdate(to, from, next, data){
>
> }
> ```

### `routerDidUpdate`

> 该钩子函数定义在`根组件`上，即入口组件
>
> 客户端路由切换结束，对应的组件渲染完毕，同时需要更新数据的所有组件也更新渲染完毕后，将触发该全局的`routerDidUpdate`钩子
>
> ```js
> static routerDidUpdate(to, from, data){
>
> }
> ```

### 示例Example

> 具体字段，请打印参数进行查看

<!--DOCUSAURUS_CODE_TABS-->
<!--根组件-->
```js
import { start } from 'award';
import { RouterSwitch, Route } from 'award-router';

@start
class App extends React.Component{

  static routerWillUpdate(to, from, next, data){
    // 任何一次路由的变化都会触发
    next();
  }

  static routerDidUpdate(to, from, data){
    // 任何路由变化结束后都会触发，不管嵌套几层路由，最终只是代表一次
    // 即表明当前切换全部完成后再触发
  }

  render(){
    return (
      <RouterSwitch>
        <Route path="/" component={Home} exact />
        <Route path="/detail/:id" component={Detail} exact />
      </RouterSwitch>
    )
  }
}

```
<!--Home路由组件-->
```js
class Home extends React.Component{

  static routeWillLeave(to, from, next, data){
    /**
     * 路由 /  切换到 /detail/1 会触发
     */
    next();
  }

  static routeDidUpdate(to, from, data){
    /**
     * 路由 /         切换到 /detail/1 会触发
     * 路由 /detail/1 切换到 / 会触发
     * 
     * data是当前组件的props数据
     * data.__award__data__ 这是表示当前站点全部缓存的数据
     */
  }

  render(){
    return <h1>home</h1>
  }
}
```

<!--Detail路由组件-->
```js
class Detail extends React.Component{

  static routeWillLeave(to, from, next, data){
    /**
     * 路由 /detail/1 切换到 / 会触发
     * 路由 /detail/1 切换到 /detail/2 会触发      
     */
    next();
  }

  static routeDidUpdate(to, from, data){
    /**
     * 路由 /         切换到 /detail/1 会触发
     * 路由 /detail/1 切换到 /detail/2 会触发
     * 
     * data是当前组件的props数据
     * data.__award__data__ 这是表示当前站点全部缓存的数据
     */
  }

  render(){
    return <h1>home</h1>
  }
}
```

<!--使用说明-->

- 路由从 `/` 切换到 `/detail/1` ,将会依次触发下面生命周期

  ```
  Home.routeWillLeave 
  => App.routerWillUpdate 
  => Detail.routeDidUpdate 
  => App.routerDidUpdate
  ```

- 路由从 `/detail/1` 切换到 `/detail/2` ,将会依次触发下面生命周期
  
  ```
  Detail.routeWillLeave 
  => App.routerWillUpdate 
  => Detail.routeDidUpdate 
  => App.routerDidUpdate
  ```

- 首次刷新地址`/`
  
  ```
  Home.routeDidUpdate    [参数from为当前path信息]
  => App.routerDidUpdate [参数from为null]
  ```

- 首次刷新地址`/detail/1`
  
  ```
  Detail.routeDidUpdate  [参数from为当前path信息]
  => App.routerDidUpdate [参数from为null]
  ```


<!--END_DOCUSAURUS_CODE_TABS-->

## 路由跳转

主要涉及路由跳转后，页面是否回到顶部，或者页面回到某一处，例如，点击跳转后，页面回到距离顶部 100px，那么该怎么定义呢？使用 `location` 对象, 传入 `data` 对象:

```js
// data 数据格式
data: {
  scroll: true,
  x: 0,
  y: 0,
}
// 这是正常滚动的默认值, 如果不要滚动, 那就设为 scroll: false 就好了
// 页面会在切换后滚动到坐标 [x, y]的位置去.
```

```jsx
// Link跳转
<Link
  to={{
    pathname: '/目标地址',
    data: {
      scroll: true, //表示是否回到顶部，如果设置为false，那么就不会滚动,连滚动到头部都不会了
      x: 0, //回到的时候x轴坐标
      y: 100, //回到顶部，但是需要距离顶部100px
    },
  }}
>
  跳转
</Link>;

//history跳转
this.props.history.replace({
  pathname: '/目标地址',
  data: {
    // 参数说明参考上面
    scroll: false,
    y: 100,
  },
});
```

## 路由重定向

- 在 `getInitialProps` 中 `throw { url }`
- Route 组件的 redirect 属性

当需要用户访问`/home`时，直接跳转到`/home/detail`

```jsx
/**
 * 通过定义 redirect 这个props来实现
 * 这种方式可以在服务端作用，推荐使用这种跳转
 *
 * 如果使用routerWillUpdate自动跳转，服务端还需要编写判断路由来执行跳转的中间件
 */
<RouterSwitch>
  <Route path="/home" component={Home} redirect="/home/detail">
    <Route path="/home/detail" component={HomeDetail} />
  </Route>
</RouterSwitch>
```

## 全局路由跳转

> 我们提供了`history` api 提供开发者进行任意跳转

示例

```js
import { history } from 'award-router'

...

history.push()

...

history.replace()

...
```
