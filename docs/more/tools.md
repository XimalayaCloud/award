---
id: tools
title: 开发工具说明
original_id: tools
sidebar_label: 开发工具说明
---

## 接入TypeScript

### `tsconfig.json`配置

```json
{
  "compilerOptions": {
    "allowJs": true,
    "module": "esnext",
    "target": "esnext",
    "jsx": "preserve",
    "experimentalDecorators": true,
    "moduleResolution": "node"
  },
  "files": ["index.d.ts"],
  "include": ["src", "components"]
}
```

### 项目根目录创建`index.d.ts`文件
```js
// 针对处理style内联文件scope方案
declare namespace JSX {
  interface IntrinsicElements {
    'award-style': any;
  }
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}
```

### 入口启动请执行start方法

> TypeScript项目在开发环境不支持使用`@start`这种es6装饰器的形式启动项目
>
> 推荐直接函数式启动，即`start(App)`

```jsx
import * as React from 'react';
import { start } from 'award';

class App extends React.Component{
  public render(){
    return <h1>hello TypeScript</h1>
  }
}

start(App);

```

### 安装`devDependencies`依赖
```json
{
  "devDependencies": {
    "@types/react": "^16.9.11"  
  },
}
```

### `types`文件说明

> 请务必将`types`文件安装到`devDependencies`处

## 自定义babel插件

`Award`提供了自定义处理babel插件的配置文件

### 示例

> 在项目根目录创建`award.babel.js`

```js
// award.babel.js
module.exports = ({ config, isServer, dev }) => {
  // 通过对config.plugins进行操作
  // 还有config.presets
}
```

> 注意
> 
> 如果是服务端渲染项目，`isServer`是作用于node端的babel插件
> 
> dev 表示是否是开发环境

## 接入eslint

> Award已经内置了`eslint-loader`，如果项目设置了`.eslintrc.js`文件，那么就会开启eslint检测

### 注意

在修改规则配置文件`.eslintrc.js`后，必须执行`rm -rf node_modules/.cache`删除缓存，然后重启服务让配置生效

### 说明

- 关于为什么全部选择使用`eslint`的[链接文章](https://juejin.im/entry/5a156adaf265da43231aa032)

- `eslint`配置查询网站[https://cn.eslint.org/docs/rules/](https://cn.eslint.org/docs/rules/)


## 接入https

- 设置启动端口为 443，例：`sudo yarn award dev -p 443`

- 根目录创建`.crt`和`.key`文件

  - 文件存放位置为当前项目根目录下

  - 这两个文件的名称都是当前项目的`package.json`文件中的`name字段`

