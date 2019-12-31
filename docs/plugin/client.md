---
id: client
title: 客户端Hook
sidebar_label: 客户端Hook
---

## 重要说明

> 请务必阅读上一章内容，大体建立对Award插件的认识
> 
> ⚠️ 着重说明 ⚠️ 以下的hook列表中，hook的标题没有特殊标识的，那么该hook支持`同步`和`异步`
>
> 创建`src/client.ts`文件，目前支持两种风格的插件编写
> 
> 1.函数形式，插件hook比较散，不易于聚合管理
> ```js
> import { ClientHooks } from 'award-plugin';
> 
> // ClientHooks用来TS类型提示的
> // options是当前使用该插件传进来的参数
> export default (hooks: ClientHooks, options: any) => {
>   hooks.init(function(params){
> 		// 开始处理params
>     // 通过this.options来获取插件自定义配置的变量
> 	})
> }
> ```
> 
> 2.对象形式，对插件功能做了聚合
> 
> ```js
> import Plugin from 'award-plugin';
> 
> export default class extends Plugin.Client{
>   apply(){
>     this.basic(hooks=>{
>       hooks.init(function(params){
> 		    // 开始处理params
> 	    })
>     })
>   }
> }
> ```
> 
>  


## basic

### init

客户端初始化时，触发该方法，此后将不再触发了

| 参数          | 说明                 | 类型            |
| ------------- | -------------------- | --------------- |
| INITIAL_STATE | 服务端返回的数据集合 | object          |
| match_routes  | 匹配到的路由         | array           |
| Component     | 根组件、即入口组件   | react.component |

### modifyInitialPropsCtx

修改客户端`getInitialProps`函数接收的参数

| 参数   | 说明               | 类型   |
| ------ | ------------------ | ------ |
| params | 默认传递的参数内容 | object |

### catchError

捕获错误，对错误进行分发处理

```typescript
export interface IcatchError {
  type: 'global' | 'router' | 'fetch';
  error: any;
}
```

| 参数  | 说明           | 类型     |
| ----- | -------------- | -------- |
| type  | 错误发生类型   | 'global' | 'router' | 'fetch' |
| error | 具体的错误详情 | Error    |

### rendered

在客户端，通过ReactDOM渲染结束后触发的钩子函数，即当前所有的组件都已经触发`componentDidMount`了

| 参数      | 说明               | 类型            |
| --------- | ------------------ | --------------- |
| Component | 根组件、即入口组件 | react.component |



## router

### routeChangeBeforeLoadInitialProps

客户端路由发生变化时，在加载数据之前，获取bundle之后触发

| 参数         | 说明             | 类型   |
| ------------ | ---------------- | ------ |
| emitter      | 全局事件监听对象 | object |
| match_routes | 匹配到的路由     | array  |


