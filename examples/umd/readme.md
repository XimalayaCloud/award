# award umd <指定umd包名称>

该命令，可以将任何award项目打包成umd包

该目录执行命令`award umd abc`，然后本地打开index.html文件，查看效果


注意：使用umd打包时，不要使用`award`的start函数，直接入口文件导出组件即可，类似当前项目的`index.tsx`文件