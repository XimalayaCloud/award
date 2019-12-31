---
id: nestedRoute
title: 嵌套路由
original_id: nestedRoute
sidebar_label: 嵌套路由
---

##

日常使用中 UI 经常是由组件之间多层嵌套所组成的结果, 这些组件之间的嵌套关系有时候也体现在 URL 上了. 所以嵌套路由是一种很常见的体现组件嵌套关系的结构.比如:

```
/user/foo/profile                     /user/foo/post/11
+------------------+                  +-----------------+
| User             |                  | User            |
| +--------------+ |                  | +-------------+ |
| | Profile      | |  +------------>  | | Posts       | |
| |              | |                  | |             | |
| +--------------+ |                  | +-------------+ |
+------------------+                  +-----------------+
```

我们现在就来实现这种嵌套路由的效果:**以下示例代码紧接上文**

首先我们要先创建`userProfile`组件

```js
class UserProfile extends React.Component {
  render() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    return (
      <div>
        <p>{id}'s Profile</p>
        <ul>
          <li>name: {id}</li>
          <li>gender: male</li>
          <li>age: 18</li>
          <li>education: high school</li>
          <li>address: 1st street No.123 room201</li>
        </ul>
      </div>
    );
  }
}
```

然后就要改造原来的路由了, 因为 User 里面可能出现 Profile 和 Posts, 并且 url 分别是 /user/foo/profile 和 /user/foo/post/11, 所以 User 的路由作为 Profile 和 Posts 的父级路由是很自然的事, 这样就需要将路由改造成下面这样:


```diff
<RouterSwitch>
-   <Route path="/user/:id/post/:postId" component={userPost} exact />
-   <Route path="/user/:id" component={user} exact />
+   <Route path="/user/:id" component={user}>
+    <Route path="/user/:id/post/:postId" component={userPost} exact />
+    <Route path="/user/:id/profile" component={UserProfile} exact />
+   </Route>
    <Route path="/test" component={Test} />
</RouterSwitch>
```

由于使用路由嵌套，所以我们还需要在`user`组件内指定`this.props.children`

```js
const user = props => (
  <div>
    <p>I am user: {props.match.params.id}</p>
    {props.children}
  </div>
);
```

好了 刷新浏览器, 访问 http://localhost:1234/user/user1/profile 和 http://localhost:1234/user/user1/post/111 试试看!

在 /user/:id/profile 中我们可以看到 profile 组件在 user 组件中渲染了, 展示出了 profile 信息,

```
I am user: user1
——————————————————————————————————————
user1's Profile

name: user1
gender: male
age: 18
education: high school
address: 1st street No.123 room201
```

在 /user/:id/post/111 中我们可以看到 post 组件在 user 组件中渲染了, 展示出了 post 信息, 这里的图和前一节的一样就不放了.
