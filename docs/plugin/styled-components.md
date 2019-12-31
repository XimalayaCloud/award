---
id: styled-components
title: 支持styled-components的插件
sidebar_label: award-plugin-styled-components
---

## ![award-plugin-styled-components](https://img.shields.io/npm/v/award-plugin-styled-components.svg)

## 安装

```sh
yarn add award-plugin-styled-components
```

## 使用

### award.config.js 的配置

```js
export default {
  plugins: ['award-plugin-styled-components'],
};
```

### 即可使用`styled-components`功能

```jsx
import { start } from 'award';
import styled from 'styled-components';

const Main = styled.h1`
  color: red;
`;


start(<Main>hello styled-components</Main>);

```

## 更新日志

### 0.0.1

- 发布可使用的稳定版本

## 版本依赖说明

| award-plugin-styled-components版本 | award版本 |
| ---------------------------------- | --------- |
| 0.0.1                              | >= 0.0.10  |