---
id: development
title: 开发教程
sidebar_label: 开发教程
---

> 请务必阅读上一章内容，大体建立对Award插件的认识

### 开始

> 初始化插件开发模板

```bash
npm init award -t plugin <你插件的项目名称，不指定就在当前目录创建>
```

## 必读规则

> Award框架在插件处理上区分了端的场景，分别提供了在客户端和node端运行时的一些重要的时机Hook
>
> 同时，插件本身也可以提供项目中使用的api，即支持默认导出，以及api注入功能，具体查看上一章

### 客户端hook

> 即代码在客户端运行的流程上处理插件提供的额外的功能
>
> 通常就是所谓的浏览器环境

### node端hook

> 即代码在Node上运行，请注意区别node服务，只要在node端运行的都算，包括命令行启动项目等等
>
> 所提供的hook包括，开发环境的构建、编译和发布产物的编译，以及Award项目在node端运行的整个流程

### 对外暴露模块（API）

> 即插件本身提供了一些api供项目中使用，在注册插件时，这些api都会被注入到`award`上，具体使用参考上一章
>
> 导出规则，**只支持default导出，如下示例**
> 
> ```js
> export default {
>   // 这里写你的api列表，而且导出的数据结构必须是对象
> }
> ```

**定义和使用示例**

> ```js
> // 插件award-plugin-demo示例
> export default {
>   start:() => {
> 	  // 一些逻辑
>     ...
>   }
> }
>
> // 使用时
> import Award from 'award';
>
> // 那么就可以使用award-plugin-demo插件提供的start函数了
> Award.demo.start();
> ```

## 开发步骤

1. 详细阅读客户端和Node端提供的hook，思考是否能实现你所需要的功能，如果欠缺，那么需要Award框架添加和调整相应的时机hook
2. 接着阅读官方插件列表提供的一系列插件的独立开发、测试的方案，通过模仿进行学习开发
3. 所有的插件都要基于`TypeScript`来开发，因为TS的类型提示和api说明，能提升插件开发的效率和动力
  
## 开发细节

1. 插件开发过程中，可能需要引用到Award相关的核心库，比如award`等，请注意不要引用任何来自工具集的库
2. 插件分别对客户端和Node端做独立处理，但是至少要处理一种，否则就不能称作Award插件了
3. 当开发客户端运行的插件时，需注意这些代码将全部在客户端运行，注意不要用到node上的一些库，比如`fs`文件操作等
4. 当开发Node端运行的插件时，可以任意的使用任何库，但请注意，尽量控制库的使用量，防止引用了危险的资源入侵服务器
5. 插件开发者应当深知`devDependencies`、`dependencies`的区别，前期官方会跟进每个插件的开发

## TS描述文件

> 插件项目需要提供对外的TS声明文件，如下示例

```js
// 定义namespace，名字都是统一的AwardPlugins
declare namespace AwardPlugins {
  // 设置当前插件需要导出的字段名称
  // 比如award-plugin-demo需要导出的名称demo，所以这里需要定义 const demo
  export const demo: IDEMO;
}

// 定义一些接口，类型等
interface IDEMO {
  start: Function;
}
```