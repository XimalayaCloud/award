---
id: award-fetch
title: award-fetch
sidebar_label: award-fetch
---

**为了统一处理服务端和客户端的请求，我们提供了`award-fetch`**

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