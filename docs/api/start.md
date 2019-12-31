---
id: start
title: start
sidebar_label: start
---

# 使用
```js
import { start } from 'award'

start(App, ErrorComponent);
```

# 说明

`start`是award框架在服务端和客户端的启动入口方法

`start`接受两个参数

- 第一个参数为当前项目的入口组件，类似`ReactDOM.render(<App/>)`
- 第二个参数为错误展示页组件，用于当页面发生`404`、`500`等一系列错误时，进行友好展示的页面