---
id: mock
title: 本地数据模拟
original_id: mock
sidebar_label: 本地数据模拟
---

## 说明

**开发环境已经内置了mock处理中间件**

> 如果你的项目是`ssr`，即`mode:"server"`，需要配置domain
> 
> ```js
> // award.config.js
> export default {
>   fetch:{
>     domainMap:{
>       "api": "http://localhost:1234"
>     }
>   }
> }
>```
>
> 说明：由于在服务器上请求接口时，需要拼接全地址
> 
> 所以这里需要指定请求地址的前面的path来作为`domainMap`的key
>
> key对应的value就是以该path为开头的请求地址，都将使用该url来进行拼接

## 示例

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

## 注意

> 1. `domainMap`指定的地址value后面不要带斜杠，因为斜杠你已经在请求url上设置了
>
>    `fetch('/api/a')`，最终会拼接成全地址`http://a.com/api/a`，然后在node服务器上发起接口请求
>
> 2. 当然一般使用mock的话，都是配置本地地址，即`/api/a`、`/api/c`的地址都是`http://localhost:你的端口号`
>
> 3. 但是如果在测试环境或者uat、生产环境运行时，当前在服务端执行请求时，还是会到这里找map，拼接出完整的url的
>
>    所以一般你需要通过环境变量来控制`domainMap`的值

## 应用

当请求`/api/info`时，那么请求会指向`/mock/api/info.js`这个文件，同时执行该文件

`/mock/api/info.js` mock 文件编写示例:

> mock工具基于`faker`
>
> 相关API可以点击[https://github.com/Marak/Faker.js](https://github.com/Marak/Faker.js)查看

```js
// 在这个环境可以获取到 ctx, mock, faker!
// next(err, data)
// 如果有 err, 那么会返回 error, 可以用来测试 error
// 这里还可以使用到 fakerjs 的 api, 这里使用参考 https://github.com/marak/faker.js
next(null, {
  msg: 'success',
  ret: 0,
  data: [
    { name: 'cat', age: '1', sex: 'male' },
    { name: 'dog', age: '2', sex: 'female' },
    // 使用 fakerjs 的 api 生成随机数据
    { name: 'fish', age: faker.datatype.number(), sex: 'male' },
  ],
});

// 如果要 mock error的情况就这这样就好了
next({
  msg: 'server failed',
  ret: -1,
});
```