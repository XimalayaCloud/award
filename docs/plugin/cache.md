---
id: cahce
title: cache插件
sidebar_label: award-plugin-cahce
---

## ![award-plugin-cache](https://img.shields.io/npm/v/award-plugin-cache.svg)

## 安装

```sh
yarn add award-plugin-cache
```

## 使用

### award.config.js的配置

> `award-plugin-cache`提供了可操作的options

```js
export default {
	plugins:[
    [
      "award-plugin-cache",
      {
        cookieName(ctx) {
          //用来根据ctx来判断出是否有当前cookie，然后插件会决定是否需要缓存
          return /test/.test(ctx.host) ? 'test' : 'prod'
        }
      }
    ]
  ]
}
```

## 更新日志

### 0.0.1

- 发布可使用的稳定版本

## 版本依赖说明

| award-plugin-cache版本 | award版本 |
| ---------------------- | --------- |
| 0.0.1                  | >= 0.0.10  |