---
id: award-fetch
title: award-fetch
sidebar_label: award-fetch
---

**为了统一处理服务端和客户端的请求，我们提供了`award-fetch`**

> `award-fetch`会根据你传的`dataType`类型自动处理response

```js
import fetch from 'award-fetch';
```

## 普通请求

```js
fetch('/api/test').then((data)=>{
  console.log(data)
})

// or
fetch({url:'/api/test'}).then(()=>{})
```

OR

```js
// /api/test?id=123
fetch('/api/test',{
  data:{
    id:123
  }
}).then((data)=>{
  console.log(data)
})

// or
fetch({url:'/api/test', data:{id:123}}).then(()=>{})
```

## 文件上传

```js
// 开始上传
const source = fetch.source();
const fileInfo = new FormData();
fileInfo.append('file', file);
fetch({
  url: '/api/upload',
  method: 'POST',
  onUploadProgress: data => {
    const { total, loaded } = data;
    this.setState({
      percent: Number(((loaded / total) * 100).toFixed(0))
    });
  },
  data: fileInfo,
  cancelToken: source.token
}).then(() => {
  message.success('上传成功');
});

// 上传中断，记住要保证是同一个source
source.cancel();
```


## 文件下载

```js
// 开始下载
const source = fetch.source();
fetch({
  url: '/api/download',
  method: 'POST',
  onDownloadProgress: data => {
    const { total, loaded } = data;
    this.setState({
      percent: Number(((loaded / total) * 100).toFixed(0))
    });
  },
  cancelToken: source.token
}).then(() => {
  message.success('下载成功');
});

// 下载中断，记住要保证是同一个source
source.cancel();
```

## 请求拦截器

```js
// 全局注册使用即可
fetch.interceptors.request.use((options) => {
  // 这里可以统一修改请求头
  // 比如给所有的请求统一添加特殊的头字段
  return options;
});
```

## 响应拦截器

```js
// 全局注册使用即可
/**
 * 回调函数支持 async await
 *
 * @data award-fetch处理后的数据结构，比如`json()`、`text()`
 *       请注意，如果解析失败，那么data将返回的是response对象结构
 * 
 * @response 请求返回的响应的对象原型 Response
 *
 * @log 输出日志，log.error
*/
fetch.interceptors.response.use((data, response, log) => {
  log.error('发生错误了', 'interceptors response');
  console.error('[response.status]', response.status);
  if (!response.ok) {
    return { num: Math.random() };
  }
  console.log('[response data]:', data);
  return data;
});
```