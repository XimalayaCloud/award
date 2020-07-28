---
title: Award，依赖导入竟然可以这样用
author: topthinking
---

> 注：以下涉及的代码均为核心实现的伪代码

## 背景

> 针对一些可以扩展 **框架功能(API)** 的插件
>
> 一方面，我们又要让开发者配置插件；一方面又需要`import`导入插件
>
> 那有没有只需要开发者配置完插件就可以使用呢？
>
> 比如[award框架](https://ximalayacloud.github.io/award/)的插件就是这样设计的


## 到底是什么？

> 为了获取配置的插件`award-plugin-dva`提供的api

- 原来我们这样用
  
  ```jsx
  import dva from 'award-plugin-dva'
    
  console.log(dva)
  ```

- 现在就可以直接这样使用

  ```jsx
  // award是某框架的核心依赖
  import Award from 'award'
    
  console.log(Award.dva)
  ```

> 点击查看更多使用细节：[https://ximalayacloud.github.io/award/docs/plugin/dva](https://ximalayacloud.github.io/award/docs/plugin/dva)
> 
> 接下来，都将以`award`这个库作为示例介绍

## 怎么做？

> 这里需要解决两个问题
>
> 1. 通过js运行时，正常执行逻辑
> 2. 通过ts解析时，可以进行代码提示

### js runtime

我们可以在`award`库内添加如下伪代码，即可实现

```js
// import Award from 'award'

const dva = require('award-plugin-dva');

export default {
  ...Award,
  dva
}
```


### ts runtime

这里需要区分两处的`TS`描述文件

1. `award` library

> award内的ts描述文件

```ts
// 定义一个namespace，用来提供对外的API提示
declare namespace Award {
    
}
```

2. `award-plugin-dva` library

> award-plugin-dva内的ts描述文件

```ts
declare namespace Award {
  export const dva: IDVA;
}

interface IDVA {
    
}
```

> 至此，我们已经完成了准备工作，但是提示仍然无法正常工作
>
> 所以我们还需要指定下`tsconfig.json`文件

### tsconfig.json

> 需要手动指定下`compilerOptions`的`types`

```json
"compilerOptions": {
    "types": ["node", "award-plugin-dva"],
}
```

## 思考

不知读者是否有如下疑问

**我们的插件是在配置文件中指定的，难道在`js runtime`时，需要引入配置文件？**

> 有时，配置文件往往会做一下node文件操作的事情
>
> 还有，并不是所有引用的插件都提供api扩展支持的，我们要做导入取舍

### 实现

这里通过`babel`对其代码进行静态编译解析，添加确实需要的代码

- 文件中的代码

  ```js
  // 添加关键词
  const plugins = "<$>award-plugin<$>"
    
  export default {
    ...Award,
    ...plugins
  }
  ```

> 当babel在解析js代码时，分析到这个关键字 **`<$>award-plugin<$>`** ，babel对其进行替换，最终替换为如下代码

- 运行时，转换后的代码
  ```js
  const plugins = (()=>{
    const result = {};
    try{
     result.dva = require('award-plugin-dva');
    }catch(e){}
    return result;
  })();
    
  export default {
    ...Award,
    ...plugins
  }
  ```



## 总结

> **项目中使用到依赖并不一定需要`import`导入，但是也不能完全不使用`import`，这就需要开发者进行权衡了**

这里主要介绍了框架设计中对于其配置文件的规范设计，同时也抛砖引玉的帮助大家拓展一种新的思维视角
