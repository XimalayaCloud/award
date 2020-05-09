---
id: webpack-include
title: 支持webpack-include的插件
sidebar_label: award-plugin-webpack-include
---

> 主要用来在编译时，让webpack不去忽略某些依赖，目前内置编译时，webpack会忽略node_modules

## ![award-plugin-webpack-include](https://img.shields.io/npm/v/award-plugin-webpack-include.svg)

## 安装

```sh
yarn add award-plugin-webpack-include
```

## 使用

### award.config.js 的配置

```js
export default {
  plugins: [
    [
      'award-plugin-webpack-include',
      // include 支持函数、字符串、正则表达式、数组
      {
        // include: function (filepath) {
        //   return false;
        // }
        // include: path.join(__dirname, '..', '..', 'node_modules')
        // include: /node_modules/
        include: [
          function (filepath) {
            return false;
          },
          /test/,
          'test'
        ]
      }
    ]
  ]
};
```

## 更新日志

### 0.0.1

- 发布可使用的稳定版本

## 版本依赖说明

| award-plugin-webpack-include版本 | award版本 |
| -------------------------------- | --------- |
| 0.0.1                            | >= 0.0.10 |