import umd from '../library/build/umd';
import { clearConsole } from '../tools/tool';

export default {
  command: 'umd [name]',
  description: '构建UMD包',
  async action(name: any) {
    process.env.UMD_NAME = name;
    process.env.BUILD_UMD = '1';
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    clearConsole();
    await umd();
    // 执行结束。立即中断node程序
    process.exit(0);
  }
};
