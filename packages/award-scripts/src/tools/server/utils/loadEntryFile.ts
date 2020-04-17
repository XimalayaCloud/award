/**
 * 开发环境加载入口文件
 */
import { join } from 'path';
import { fromJS } from 'immutable';
import * as Loadable from 'react-loadable';
import { DocumentComponent } from 'award-utils/server';
import removeModule = require('../../remove');
import { IConfig, IServer } from 'award-types';

export default function(this: IServer) {
  return new Promise(async (resolve, reject) => {
    try {
      const { entry, mode } = this.config.toObject() as IConfig;

      this.RootPageEntry = join(this.dir, entry);

      if (mode === 'server') {
        // 只是是服务端渲染的类型，才必须要require代码并进行解析

        // 引用入口直接执行AppRegistry
        require(this.RootPageEntry);
        // 预加载所有模块
        await Loadable.preloadAll();

        if (this.RootComponent === null) {
          // 说明没有执行start方法
          reject(new Error('请确认入口已经使用start方法启动了'));
        }
        // 重新计算当前入口的路由表
        this.routes = fromJS(global.__AWARD__INIT__ROUTES__ || []);
      }

      // 获取document.js
      const { doc, Component } = DocumentComponent(this.dir);
      if (Component) {
        removeModule(doc);
      }

      this.RootDocumentComponent = Component;
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
