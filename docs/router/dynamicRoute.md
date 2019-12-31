---
id: dynamicRoute
title: 动态路由
original_id: dynamicRoute
sidebar_label: 动态路由
---

## 介绍

使用 pattern 来匹配某一类路由这是再常见不过的场景了, 比如 /user/:id 用来匹配各种用户 id, 这种我们就可以用动态路由来做了

使用动态路由没什么特别不同的地方, 其实就是在 path 中使用一个 pattern, 比如:

| pattern                | matched path        | match.params                    |
| ---------------------- | ------------------- | ------------------------------- |
| /user/:id              | /user/foo           | `{ id: 'foo' }`                 |
| /user/:id/post/:postId | /user/foo/post/1234 | `{ id: 'foo', postId: '1234' }` |

match 是传入到 **路由组件** 的 props 之一

## pattern

我就来实现一下上面表格里面描述的路由吧

默认入口`index.js`文件内添加组件 `user`、`userPost`

```js
const user = props => (
  <div>
    <p>I am user: {props.match.params.id}</p>
  </div>
);
```

```js
const userPost = props => (
  <div>
    <h3>Post#{props.match.params.postId}</h3>
    <p>...</p>
    <hr />
    <p>by {props.match.params.id}</p>
  </div>
);
```

添加启动代码

```jsx
import { start } from 'award';
import { RouterSwitch, Route } from 'award-router';

start(
  <RouterSwitch>
    <Route path="/user/:id/post/:postId" component={userPost} exact />
    <Route path="/user/:id" component={user} exact />
  </RouterSwitch>
);
```

执行`yarn award dev`命令，启动项目

进入路由[/user/user1](http://localhost:1234/user/user1), 将会看到: `I am user: user1`

进入路由[/user/user1/post/11](http://localhost:1234/user/user1/post/11), 将会看到:

```
Post#11
...
—————————————————————————————————————————————————————————————————
by user1
```

## query params

> 直接在`getInitialProps`函数里面，通过`ctx.query`来获取序列化后的queryString对象

这里我们使用 /test 路由来演示一下:

添加/test路由, 因为需要匹配`/test?a=b`这类url, 不能有exact属性

```diff
  <RouterSwitch>
    <Route path="/user/:id/post/:postId" component={userPost} exact />
    <Route path="/user/:id" component={user} exact />
+   <Route path="/test" component={Test} />
  </RouterSwitch>
```

添加`test`组件

```js
class Test extends React.Component {

  static getInitialProps(ctx){
    return {
      title: ctx.query.title
    }
  }

  render() {
    const search = this.props.location.search;    
    return (
      <div>
        {this.props.title ? <h1>{this.props.title.toUpperCase()}</h1> : null}
        <p>This is Test page, query is: "{search}"</p>
      </div>
    );
  }
}
```

现在访问 http://localhost:1234/test?title=hello 我们会看到 HELLO 作为了下面内容的标题, 我们成功拿到了 url 中的数据了!!
