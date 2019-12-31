---
id: dva
title: dva插件
sidebar_label: award-plugin-dva
---

## ![award-plugin-dva](https://img.shields.io/npm/v/award-plugin-dva.svg)

> 
> 注意: 服务端场景不要通过`dispatch触发effects`操作
>
> 主要原因，触发`effects`后，`redux-saga`需要去遍历通知各个`listener`，但是在服务端这是没有意义的，反而会增加内存和 cpu 的压力

```js
// model 格式, 具体可以参考 dva 文档
const model = {
  namespace: 'xxxx',
  state: {},
  reducers: {},
  effects: {},
};
export default model;
```


## 安装

```sh
yarn add award-plugin-dva
```

## 使用

> `award-plugin-dva`提供了导出库,即可以通过`import Award from 'award'`来获取Award.dva插件提供的api能力
>
> 增强了项目的能力

### award.config.js的配置

```js
export default {
	plugins:["award-plugin-dva"]
}
```

### 引用

**只需在`根组件`引用定义即可**

> TS 开发也必须是这种 import 形式

```js
import Award from 'award'

// models是model集合的数组，基本是全局使用的model
// model的概念基于Award.dva
@start
@Award.dva.start(models)
class App extends React.Component {
  ...
}

```

## 配合`getInitialProps`使用

> 注意：在服务端只能 dispatch 到 reducer 方法

**路由组件示例**

```js
// 路由组件对应的model示例
export default {
  namespace: 'home',
  state: {
    name: '',
  },
  reducers: {
    change(state, { name }) {
      Object.assign(state, { name });
    },
  },
};
```

```js
// 路由组件代码如下
import { connect } from 'react-redux';

import model from './model';

@connect(({ home }) => {
  return {
    name: home.name,
  };
})
class Home extends React.Component {
  static getInitialProps(ctx) {
    // 如果引用了dva，那么ctx.store生效
    ctx.store.disptach({
      type: 'home/change',
      name: 'world',
    });
  }

  // 按需加载model
  static model = [model];

  render() {
    return <h1>hello {this.props.name}</h1>;
  }
}

export default Home;
```

## 按需加载 model

**我们实现了根据路由按需加载 model**

```js
// 给路由组件附加 model
class RouterComponent extends React.Component {
  static model = [relativeModel1, relativeModel2, ...]
}

// or

RouterComponent.model = [relativeModel1, relativeModel2, ...]

```

## 错误处理

主要处理`dva`内部执行抛出的错误异常，需要特别对待

```js
import Award from 'award';

@start
@Award.dva.start([model], onError)
class App extends React.Component {
  ...
}

/*
dispatch: dispatch 函数
extension: {
  key: "info/add",
  effectArgs: [
    {
      type: "info/add"
    }
  ]
}
*/
function onError(error, dispatch, extension) {
  console.log('dva发生错误', e, dispatch, extension);
}
```

## 全局 store

`award`提供了全局 store 来方便开发者自由处理数据，使用规则类似`setAward`

```js
import Award from 'award';

Award.dva.store.disptach({});
```

## connect

> 使用方法类似`react-redux`，只是不需要在处理 action 了

```jsx
import { connect } from 'react-redux';

/**
 * 例如存在model
 * 
  model = {
   namespace: 'info',
   state:{
     name:'test'
   }
  }
 *
*/
@connect((models) => {
  // models是所有model的namespace集合
  return {
    name: models.info.name,
  };
})
class App extends React.Component {
  render() {
    return <p>显示name --- {this.props.name}</p>;
  }
}
```

## 集成 immer

内部已经集成了[immer](https://github.com/immerjs/immer)，所以你的 reducers 可以这样写

```js
// 直接修改state即可
{
  state:{
    name: 'hello immer'    
  },
  reducers: {
    changeName(state, { name }) {
      Object.assign(state,{ name })
    }
  }
}
```

> **切记不能对model原型做修改，否则在服务端渲染时，会出现数据错乱的bug**
>
> 换句话说，您只需要根据上述示例进行操作即可

## 全局model注册

`award-plugin-dva`提供了全局注册函数`registerModel`，方便开发者使用

> 使用`registerModel`注意事项
>
> 1. 必须全局使用，即不能在组件内使用
> 
> 2. 只支持单个model的注册，多个请自行处理
>
> 3. 注册的model将挂载到全局，同时也自动支持按需加载了
>
> 4. 非常不推荐大量使用该函数，易导致model冗余以及项目大了以后不易管理的问题，请慎重考虑后使用！

**使用**

```js
// 引入 registerModel
import Award from 'award'

// 引入当前的model
import model from './model'

// 直接注册即可
Award.dva.registerModel(model)

// 接下来，就可以在组件上通过connect来获取并使用该model上的数据了
```

## 更新日志

### 0.0.1

- 发布可使用的稳定版本

## 版本依赖说明

| award-plugin-dva版本 | award版本 |
| -------------------- | --------- |
| 0.0.1                | >= 0.0.10 |