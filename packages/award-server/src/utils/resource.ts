/**
 * 生产环境初始化所有资源
 */
import * as fs from 'fs-extra';
import { join } from 'path';
import { Seq, fromJS } from 'immutable';
import { IConfig, IServer } from 'award-types';
import * as Loadable from 'react-loadable';

let isReadPublicMap = false;

export default async function(this: IServer) {
  if (!this.apiServer && !this.dev) {
    if (!isReadPublicMap) {
      isReadPublicMap = true;

      const config = this.config.toObject() as IConfig;
      const { server_dist, entry, mode } = config;

      // 读mapFile、manifestFile, documentFile
      const mapJson = join(this.dir, server_dist, '.awardConfig/map.json');
      const manifestDir = join(this.dir, server_dist, '.awardConfig/manifest.js');
      const documentDir = join(this.dir, server_dist, 'document.js');
      const ico = join(this.dir, 'favicon.ico');

      // 读取资源映射名称
      if (fs.existsSync(mapJson)) {
        // 保证数据源数据不变性
        this.map = Seq(JSON.parse(fs.readFileSync(mapJson, 'utf-8')) as object);
      }

      // 读取manifest文件
      if (fs.existsSync(manifestDir)) {
        this.manifestFile = fs.readFileSync(manifestDir, 'utf-8');
      }

      // 读取favicon.ico
      if (fs.existsSync(ico)) {
        this.favicon = fs.readFileSync(ico);
      }

      // require  document组件
      if (fs.existsSync(documentDir)) {
        const DocumentComponent = require(documentDir);
        this.RootDocumentComponent = DocumentComponent.default || DocumentComponent;
      }

      // 获取入口文件地址
      this.RootPageEntry = join(this.dir, server_dist, entry.replace(/\.tsx?$/, '.js'));

      if (mode === 'server') {
        // 引用入口直接执行AppRegistry

        require(this.RootPageEntry);

        await Loadable.preloadAll();

        if (this.RootComponent === null) {
          // 说明没有执行start方法
          throw new Error('请确认入口已经使用start方法启动了');
        }

        // 解析路由规则，获取当前项目的所有路由列表
        // 保证数据源数据不变性
        this.routes = fromJS(global.__AWARD__INIT__ROUTES__ || []);
      }
    }
  }
}
