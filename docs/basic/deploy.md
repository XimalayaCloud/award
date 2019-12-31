---
id: deploy
title: 部署
original_id: deploy
sidebar_label: 生产环境部署
---

**Award项目部署分服务端渲染应用和单页应用**

## 服务端渲染应用

> **注意** 请按照如下顺序进行操作，以便可以正常部署到生产环境

### 1.1 编译源代码

通过`award build`命令，编译出两份资源，即提供给web端使用、node端使用以及一些少量配置文件(比如静态资源映射地址等)

```sh
yarn award build
```

### 1.2 部署静态资源

> **Award项目的静态资源会编译到`dist`目录下**
>
> 你可以有如下两种方案去发布静态资源

- 1.单独将dist目录资源上传到CDN服务，即保证了静态资源的稳定发布

- 2.在`server.js`文件内创建读取`dist目录`的文件服务中间件，即让CDN资源服务映射到node服务上

> 通常在实际项目中，我们推荐使用第一种发布方案
>
> **原因** 当存在多台node服务时，我们在发布上线时，CDN资源可能会映射到旧的node服务上，这样就导致了资源未找到，造成页面短时间的静态资源丢失的问题

### 1.3 部署node服务

> **Award项目的静态资源会编译到`.award`目录下**
>
> 但是在node服务端运行往往少不了`node_modules`，在发布之前，我们还需要对依赖做处理，其实这就是为什么award要区分两个包的原因了

- 移除node_modules中`devDependencies`的依赖，即命令`yarn install --production`。这样既保证了第三方依赖资源的可控性，又减少了发布文件的体积，降低了服务资源消耗

- 我们需要通过部署工具，例如(pm2)，在生产环境上部署我们的node服务，所以需要准备`server.js`和pm2的配置文件
  
  **server.js**
  ```js
  const Server = require('award/server');
  const app = new Server();
  app.listen(3000);
  ```

  **ecosystem.config.js**

  [点击查看如何写配置文件](https://pm2.keymetrics.io/docs/usage/application-declaration/#javascript)

  ```js
  const { name } = require('./package.json');
  module.exports = {
    apps: [
      {
        name,
        script: 'server.js',
        instances: 2,
        exec_mode: 'cluster',
        max_memory_restart: '500M',
        merge_logs: true,
        error_file: `/var/log/${name}/err.log`,
        out_file: `/var/log/${name}/out.log`,
      },
    ],
  };
  ```

- 至此我们发布node服务的文件准备工作已然完成
  - 你可以制作成docker镜像发布
  - 亦可以打包成zip，上传到生产服务器，解压出资源文件

- 启动服务
  - 关于docker发布，请查阅pm2是如何处理docker发布的
  - 解压完成后，（当然生产服务器上肯定要事先全局部署pm2服务的，即`npm install pm2 -g`），然后即通过pm2相关的启动命令启动pm2配置文件

- 关于pm2的注意细节
  当你的服务器上发布多个不同的node服务时，会涉及到每个项目的重启，往往会遇到如下问题`ENOENT: no such file or directory, uv_cwd`
  [点击查看issue，了解更多](https://github.com/Unitech/pm2/issues/2057)

## 单页应用

### 2.1 编译源代码

**提供了单页导出命令，会导出`index.html`，关于单页的配置请配合award的配置文件进行使用**

```
yarn award export
```

### 2.2 部署静态资源

> **Award项目的静态资源会编译到dist目录下**
> 
> 由于这里没有node服务，所以直接把资源上传到CDN或者拷贝到你们的后端服务吧
>
> 和传统的单页发布时一致的

### 2.3 部署`index.html`

**执行导出命令后，`dist`根目录下会生成index.html，你需要将其拷贝给后端应用进行部署**