---
id: intro
title: 介绍
sidebar_label: 说明
---

> Award提供了丰富的插件功能，旨在为了在更大程度上扩展整个框架的功能和生命力
>
> 插件基于Award框架生态，具有独立管理、独立发布的特点

## 命名规则

所有插件的名称必须以`award-plugin-`开头，紧接着后面的名称需要说明该插件的用途

譬如`pwa`插件命名为`award-plugin-pwa`

那么除了`award-plugin-`以外的的字符，也必须以小横杠`-`连接，比如`award-plugin-server-cache`等

## 使用步骤

### 1. 安装插件

> 插件包的名称都是以`award-plugin-`开头的

```sh
yarn add award-plugin-<插件描述名称>
```

### 2. 注册插件

> 需要在award.config.js配置文件中指定插件，插件执行的顺序是从上往下的
> 
> 配置规则类似babel插件，支持options。定义插件的名称，可以是变量，可以是字符串，**但是请确认最终代码运行后的插件名称都是字符串，这一点和babel插件有些差异**
>
> option如果配置了函数，请不要在函数内使用调用，例如
> ```js
> function a(){
>   require('./fun')();
> }
> ```
> 
> 具体如下示例
  
```js
// award.config.js
export default {
	plugins:[
		"award-plugin-pwa",
		[
			"award-plugin-cache",
			{
				cookieName(ctx) {
					return /test/.test(ctx.host) ? 'test' : 'prod';
				}
			}
		]
	]
}
```

### 3. 插件注入

> 即有些插件会默认导出一些特定功能的API，具体参考各个插件提供的文档说明
>
> Award框架在注册插件时，可以将这些类型的插件提供的API注入到`award`这个库上，类似挂载
>
> 插件注入的API，是解析当前插件是否存在`export default`导出的api，然后将其挂载到`award`上，同时重命名
> 
> 如下示例

1. 假设存在示例插件`award-plugin-demo`，该插件可以直接导出API
   ```js
   import demo from 'award-plugin-demo';
   ```
2. 然后在`award.config.js`内注册了该插件
3. 那么，在项目中就可以这样使用其提供的api了
   ```js
   import Award from 'award'

   console.log(Award.demo);
   ```

### 4. 注入命名规则

> 介绍插件注入到`award`上后的重命名规则，过滤开头的`award-plugin-`，后面采用驼峰式

1. 所有插件注册的名称都是以`award-plugin-`开头，注意，最后有个小横杠
2. 那么除了`award-plugin-`以外的的字符，也必须以小横杠`-`连接，比如`award-plugin-server-cache`等
3. 注入命名时，将忽略开头的`award-plugin-`字符串，比如上述例子，得到`server-cache`
4. 重命名，将这个`-`后面跟的第一个字符改为大写，即重命名为驼峰式，比如上述例子，最终名称为`serverCache`
5. 如果该插件存在导出模板，那么，在项目中就可以这样引用了`import { serverCache } from 'award'`

### 5. TypeScript项目使用注意

1. 引用规范，不支持类似这种引用形式：`import { demo }  from 'award'`

    **正确示例，如下**
    ```js
    import Award  from 'award';
    // 通过这种形式来获取demo
    const { demo } = Award
    ```
2. `tsconfig.json`添加如下配置

    ```json
    // 需要添加types，后面接需要引用的插件库的名称，如下示例
    {
      "compilerOptions": {
        "types":["node","award-plugin-demo"]
      },
    }
    ```