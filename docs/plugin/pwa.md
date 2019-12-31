---
id: pwa
title: pwa插件
sidebar_label: award-plugin-pwa
---

## ![award-plugin-pwa](https://img.shields.io/npm/v/award-plugin-pwa.svg)


## 安装

```sh
yarn add award-plugin-pwa
```

## 使用

### award.config.js的配置

> `award-plugin-pwa`提供了可配置的options

```js
export default {
	plugins:[
    [
      "award-plugin-pwa",
      {
        // 指定你编写的service-worker的入口文件地址
        filename: path.join(__dirname, 'service-worker/index.js'),
        // 如果当前访问在某个子pathname下，那么需要指定basename，该basename和award配置里面的basename是一致的
        basename: '',
      },
    ]
  ]
}
```

## 更新日志

### 0.0.1

- 发布可使用的稳定版本

## 版本依赖说明

| award-plugin-pwa版本 | award版本 |
| -------------------- | --------- |
| 0.0.1                | >= 0.0.10  |