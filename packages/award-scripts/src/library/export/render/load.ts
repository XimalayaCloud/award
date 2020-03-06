import { join } from 'path';
import { IConfig } from 'award-types';
import { DocumentComponent, extensions } from 'award-utils/server';

export default (config: IConfig, dir: any): any => {
  return new Promise(async (resolve, reject) => {
    try {
      const { entry, mode } = config;
      const RootPageEntry = join(dir, entry);
      let RootComponent = () => null;

      if (mode === 'client') {
        global.AppRegistry = (Component: any) => {
          RootComponent = Component;
        };
        extensions(config);

        // 引用入口直接执行AppRegistry
        require(RootPageEntry);
      }

      // 重新计算当前入口的路由表
      const routes = global.__AWARD__INIT__ROUTES__ || [];

      // 获取document.js
      const { Component } = DocumentComponent(dir);

      resolve({
        routes,
        RootComponent,
        RootDocumentComponent: Component
      });
    } catch (error) {
      reject(error);
    }
  });
};
