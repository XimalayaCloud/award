/**
 * 给入口文件添加热更新代码的babel插件
 */
const cwd = process.cwd();

const moduleHot = (tpl: any) =>
  tpl(`
  if (module && module.hot) {
    module.hot.accept();
    module.hot.addStatusHandler((status)=>{
      if(status === 'apply'){
        console.log("热更新...");
        window.award_hmr = true;
      }
    });
  }
 `)();

export default (babel: any) => {
  const { types: t, template: tpl } = babel;

  return {
    name: 'hmr',
    visitor: {
      Program(_path: any, state: any) {
        /**
         * 在入口文件处添加如下代码
         * if (module && module.hot) {
         *   module.hot.accept();
         * }
         */
        const reference = state?.file?.opts.filename;
        if (reference && reference === state.opts.entry) {
          _path.node.body.push(moduleHot(tpl));
        }
        _path.traverse({
          ExportDefaultDeclaration(path: any) {
            const filename = state.filename;
            // 添加热更新模块
            // export default hot(module)(App)
            if (filename.indexOf(cwd) !== -1) {
              if (global.routeFileNames.indexOf(filename.replace(cwd, '')) !== -1) {
                // 当前是路由组件
                const declaration = path.node.declaration;
                let identi = t.Identifier('AWARD_DEV_DEFAULT');
                if (t.isClassDeclaration(declaration)) {
                  _path.node.body.push(
                    t.ClassDeclaration(identi, declaration.superClass, declaration.body)
                  );
                } else {
                  _path.node.body.push(
                    tpl(`const __AWARD_DEV_DEFAULT_ = DEFAULT`)({
                      __AWARD_DEV_DEFAULT_: identi,
                      DEFAULT: declaration
                    })
                  );
                }
                path.remove();
                const hot = t.Identifier('__AWARD_HOT_');
                _path.node.body.unshift(
                  tpl(`import { hot as __AWARD_HOT_ } from 'react-hot-loader'`)({
                    __AWARD_HOT_: hot
                  })
                );
                _path.node.body.push(
                  tpl(`export default __AWARD_HOT_(module)(__AWARD_DEV_DEFAULT_)`)({
                    __AWARD_DEV_DEFAULT_: identi,
                    __AWARD_HOT_: hot
                  })
                );
              }
            }
          }
        });
      }
    }
  };
};
