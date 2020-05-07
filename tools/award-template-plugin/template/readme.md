# award-plugin-<%=name%>

> 声明: 插件开发依赖安装请使用`yarn`工具，只能使用该工具，因为我们需要通过其`link`功能来实现模块引用

# 插件使用介绍

> 这里将填写你插件的使用规范和规则，请务必详细填写，方便其他开发者使用

# 更新日志

> 请列出每个版本的更新内容

# 版本依赖

> 请列出每个版本依赖的award版本是什么

# 开发步骤

```sh
#1. 安装依赖
yarn 

#2. 启动开发环境
yarn dev

#3. 切换到默认示例目录
cd examples/basic

#4. 运行示例
../../node_modules/.bin/award dev

#4. 或者这样运行
yarn dev

#5.  开发演示
#5.1 修改文件`src/plugin/node.tsx`内的文字内容，然后保存
#5.2 刷新浏览器页面，你可以看到你修改的内容立即显示出来
```

# 开发要求

**你必须在`src/plugin`目录内编写插件的核心逻辑**

> 关于插件的具体开发步骤和注意细节，[请点击文档查看](http://ximalayacloud.github.io/award/docs/plugin/development/)

# 发布步骤

> 开发完成后，我们需要将插件发布到npm上，提供其他开发者使用

```sh
# 修改版本号
cd src
# 打开src目录下的package.json
# 修改其版本号和确认是否添加第三方依赖包

# 发布，回到根目录
npm run build
```