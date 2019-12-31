---
id: getInitialProps
title: getInitialProps
original_id: getInitialProps
---

## 使用示例:

### 同步用法:

```js
const App = ({ date }) => <h1>hello Award, {date}</h1>;

App.getInitialProps = (ctx) => {
  return {
    date: new Date().toLocaleTimeString(),
  };
};
```

### 异步用法 1:

```js
// 300ms 后返回 date 数据
const getApiData = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('getApiData');
      resolve(new Date().toLocaleTimeString());
    }, 300);
  });

App.getInitialProps = async (ctx) => {
  const asyncData = await getApiData();
  return {
    date: asyncData,
  };
};
```

### 异步用法 2:

返回 `{kev: value}` 结构的异步数据

> award 内部会使用 promise.all 将数据获取完毕然后进行渲染.

```js
const Zoo = (props) => {
  // console.log('Zoo', props)
  return (
    <div>
      <h1>This is a Zoo</h1>
      <p>name: {props.name}</p>
      <p>age: {props.age}</p>
      <p>eatTime: {props.eatTime}</p>
      <p>love: {props.love}</p>
    </div>
  );
};

Zoo.getInitialProps = async (ctx) => {
  console.log('start zoo getInitialProps');
  return {
    love: 'eat',
    name: new Promise((r) => {
      setTimeout(() => {
        console.log('get name!');
        r('littleCat' + (0 | (Math.random() * 10)));
      }, 500);
    }),
    age: new Promise((r) => {
      setTimeout(() => {
        console.log('get age!');
        r(0 | (Math.random() * 10));
      }, 1000);
    }),
    eatTime: fakeApi(new Date().toLocaleTimeString(), 1500),
  };
};

function fakeApi(v, ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('get eatTime!');
      resolve(v);
    }, ms);
  });
}
```

## getInitialProps 接收 ctx 对象作为参数

ctx 属性说明:

| 参数     | 说明                                                                         | 类型                    | 默认值 |
| -------- | ---------------------------------------------------------------------------- | ----------------------- | ------ |
| history  | 操作 history 对象                                                            | history 对象            | -      |
| location | 关闭动画结束后触发的回调函数                                                 | Location 对象           | -      |
| query    | url 上的 query 被 qs 化后的对象, 例如 ?a=1&b=2, 那么 query 就是 {a: 1, b: 2} | queryStringObj          | {}     |
| req      | koa Request 对象(server only)                                                | Koa Request             | -      |
| route    | 当前匹配的路由(server only)                                                  | Route                   | -      |
| routes   | 当前 url 匹配到的路由列表(server only)                                       | MatchedRoute[]          | -      |
| match    | 如果路由定义了动态路由，可以通过这个获取动态值                               | react-router match 对象 | false  |
