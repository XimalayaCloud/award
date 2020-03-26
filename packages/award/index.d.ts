declare namespace AwardPlugins {
  /**
   * 使用 Consumer 获得全局 store
  ```
  <Consumer>
    {(store) => {
      console.log('the global store: ', store);
      return <YourComponent />;
    }}
  </Consumer>
    ```
   */
  export const Consumer: any;

  /**
   * 设置meta信息
    ```
    <Head>
      <title>这是标题</title>
    </Head>
    ```
   */
  export const Head: any;

  /**
   *    启动react渲染,只能执行一次，就算后续执行了也不会启任何作用，并且会在控制台进行错误提示
   *    @Component       项目启动入口组件
   *    @ErrorComponent  展示错误的组件
   */
  export const start: (Component: any, ErrorComponent?: any) => void;

  /**
   * setAward是award内置的一个迷你数据管理, 方便解决数据复杂度不大, 业务逻辑相对简单的场景的数据管理需求
   *
   * ```
   * setAward({ name: Math.random() });
   * ```
   */
  export const setAward: (data: { [key: string]: any }) => Promise<any>;

  /**
   * 删除 name 字段
   *
   * `removeAward('name');`
   */
  export const removeAward: (data: string) => void;

  /**
   * 获取basename
   */
  export const basename: () => string;
}

/**
 *
 * `start` 函数，启动award应用
 *
 * `Head` 组件，设置header部分内容
 *
 * `Consumer` 组件，使用setAward设置的数据
 *
 * `setAward` 函数，设置store
 *
 * `removeAward` 函数，移除指定的store
 *
 * `basename` 函数，获取项目的basename
 *
 * `ErrorProps` TS类型，指定错误组件的props的ts描述
 *
 *
 */
declare module 'award' {
  import Consumer from 'award/lib/consumer';
  import { Helmet as Head } from 'react-helmet';
  import start, { ErrorProps } from 'award/lib/start';
  import setAward from 'award/lib/setAward';
  import removeAward from 'award/lib/removeAward';
  export default AwardPlugins;
  const basename: () => string;
  export { Head, Consumer, start, setAward, removeAward, basename, ErrorProps };
}
