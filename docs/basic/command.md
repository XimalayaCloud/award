---
id: command
title: 命令介绍
original_id: command
sidebar_label: 命令介绍
---

Award提供了`award`、`award-debug`这两个命令供开发者使用

## `award dev` 开发

> 【默认】`process.env.NODE_ENV = 'development'`

### `-p` 指定访问端口

**`award dev -p 3000`** 指定启动`3000`端口，默认是`1234`

### `-i` 忽略系统默认错误提示

**`award dev -i`** 在发生错误后，展示页渲染的组件将来自[`start函数`](intro#开始)指定的错误组件

## `award build` 构建(SSR)

> 【默认】`process.env.NODE_ENV = 'production'`
>
> 提供统一构建命令`award build`

- 构建node环境运行的代码 `process.env.RUN_ENV = 'node'`

  代码输出到根目录`.award`文件夹中

- 构建web客户端运行的代码 `process.env.RUN_ENV = 'web'`

  代码输出到根目录`dist`文件夹中



## `award export` 构建(SPA)

> 构建单页应用项目，生成`index.html`入口文件，输出到根目录`dist`文件夹中
> 
> 【默认】`process.env.NODE_ENV = 'production'`
>
> process.env.RUN_ENV = 'web'

### `-l`

强制指定`assetPrefixs="./"`，开发者可以在本地通过`file`协议访问导出的html

### `-b`

> 【默认】`process.env.NODE_ENV = 'test'`

开发者在本地访问html时，一旦涉及到接口请求，页面访问就会出错，指定`-b`可以解决该问题

### `--html`

路由切换时，如果设置了导出该页面的path，那么会优先去加载该页面的html

**示例**

- 当前访问页面地址：`/index.html#`

- 当切换到路由b时，当前访问地址：`/b.html/#/b`。前提条件就是设置了导出`b.html`，否则访问地址为`/index.html/#/b`

## `award-debug` 调试

> 只是将命令`award`替换为`award-debug`，其余参数和功能如上所述
>
> **⚠️ 但是需要注意的事：`vscode`需要进行如下设置**

1. 项目根目录创建`.vscode`文件夹，这个是vscode的配置文件所在的文件夹
2. 在`.vscode`创建`settings.json`文件
  
   ```json
   // settings.json文件内容
   {
     "debug.node.autoAttach": "on",
   }
   ```
3. 比如执行`award-debug dev`命令，即可开启`vscode`的断点调试了

