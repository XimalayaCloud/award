---
id: static
title: 静态资源使用说明
original_id: static
sidebar_label: 静态资源使用说明
---

由于在服务端渲染时，需要预先准备好样式资源文件，这边做了一些特殊处理

- 生产环境支持按路由进行样式拆分
- 无需加任何代码，默认支持样式scope

## 样式

> 仅支持样式格式如下`.sass` `.scss` `.css`
>
> 请使用`import`来引用样式，这样引用的样式会根据引用规则做scope处理
>
> 如果使用`require`引用的样式，那么就不会添加样式scope了

**样式引用分`全局生效`和`当前组件生效`**

```js
// 末尾加感叹号表示样式对全局生效
import './common.scss!';

// 不加感叹号表示样式对当前组件生效
import './app.scss';
```

### scope说明

- 项目内会随机两位数scope算法，在一定程度上保证了稳定随机
- 同时增加了map文件，默认没有，需要在package.json指定

**示例**
```json
{
  "map": true
}
```

> 当指定了map为`true`后，项目根目录会生成`.map`文件，该文件变化的原因是基于当前项目的文件结构的变化而变化的
>
> 使用该文件，可以在项目结构发生轻微的变化时，不会导致样式scope发生重命名，这样生成的静态资源的hash名称就不会频繁更换
>
> 用户可以在浏览器端更好的使用静态资源缓存

### scope传递

> 常见场景`NavLink`的使用
 
**示例**

`组件A`
```jsx
class A extends React.Component{
  render(){
    return <h1 className={this.props.className}></h1>
  }
}
```

`组件B`

```jsx
import A from 'A';
import './b.scss';
class B extends React.Component{
  render(){
    // 如果需要让b.scss的样式作用到组件A，请必须添加className=""
    return <A className=""/>
  }
}
```

### 类vue样式scope

> 针对`小组件`以及`样式内容较少`的js文件，如下示例

```js
const Header = () => (
  <div>
    <h1>this is header</h1>
    <award-style>
      {`
        h1{
          color:red;
        }
      `}
    </award-style>
  </div>
)
```
> 直接在当前js文件的任何地方写`award-style`组件，无需引用任何库，
>
> **请注意：模板字符串不支持变量，因为静态编译阶段会将模板字符串全部读取，所以如果写了变量会进行报错提示**
> 
> 或者如下示例

```js
<award-style>
  {`
    h1{
      color:red;
    }
  `}
</award-style>

const Header = () => (
  <div>
    <h1>this is header</h1>    
  </div>
)
```

## 图片

> 推荐使用`import`导入图片
>
> 支持图片格式 `.jpg` `.jpeg` `.png` `.gif` `.svg`

```js
import bg from './1.png'

<img src={bg}>
```

### base64

根目录创建配置文件`.es-style.json`，进行如下设置

```json
{
  "limit": 50000
}
```
当图片大小`<=50000`字节，即`<=50kb`时，将会转为base64

### sprite

> 只针对当前一个样式文件内所有图片的处理
> 
> 当设置了相应参数后，会自动将当前文件内的所有图片进行雪碧图处理

**样式文件顶部添加如下设置**

```css
/* sprite */

开始编写样式
...

```
**注意**

> CSS sprite 生成的图片大小是固定的
>
> 即当前展示区域的大小必须和图片的大小一致，因为雪碧图处理会修改background-size属性


## antd

> 系统已内置antd样式按需加载的babel插件配置了
>
> 开发者只需在项目中自行安装`antd`库后即可import使用了

### 修改主题

**设置`package.json`，指定主题配置文件**
```json
{
  "theme":"./theme.js"
}
```

**开发匹配文件`theme.js`，请点击查看[`antd官方`](https://ant.design/docs/react/customize-theme-cn#Ant-Design-%E7%9A%84%E6%A0%B7%E5%BC%8F%E5%8F%98%E9%87%8F)的具体配置变量**
```js
module.exports = {
  'primary-color': '#1DA57A',
  'link-color': '#1DA57A',
  'border-radius-base': '2px',
};
```

## 代码拆分

`Award`框架内部提供了基于`路由组件`的代码拆分处理，这个是由框架内部自动完成，无需开发者配置

**同时我们还提供给开发者进行自定义组件拆分的方法**

### 示例

> 基于`react-loadable`这个库
>
> 开发者不需要安装、也不需要做任何配置，只需要按下面的例子使用即可
>
> 因为在服务端渲染时需要做一些定制的配置，Award已经将其内置了

**index.js `根组件`**

```jsx
...

import Loadable from 'react-loadable';

const LoadableComponent = Loadable({
  loader: () => import('./app.js'),
  loading: () => <p>加载中...</p>,
  delay: 3000
});

start(() => (
  ...
    <LoadableComponent />
  ...
));
```

**app.js**

```jsx
import './app.scss';

class App extends React.Component {
  render() {
    return <h1>hello world - app</h1>;
  }
}

export default App;
```

> 那么会把 app.js 这个组件拆分出一个单独的 js 文件
>
> 上面只是个例子，在实际开发中，不推荐对这种小的组件进行代码拆分
>
> 一般对一些大型组件进行按需加载，比如类似`antd`

## 外部依赖引用（非require引用）

比如一个 js 文件需要被外置引入, 譬如名字叫 `a.js`, 那么需要在 package.json 中添加如下字段:

```json
"external": {
  // 表示引用的a.js映射到本地jquery.js文件
  "a.js": "./static/jquery.js"
}
```

然后在[`document.js`](document)中需要添加如下代码即可引入该external文件

> 注意：这里不能通过`require('./award.config.js')`来获取assetPrefixs      

```js
const { assetPrefixs } = this.props;

<script src={assetPrefixs + `external/a.js`} />

// 防止缓存，自行添加时间戳
<script src={assetPrefixs + `external/a.js?v=${+new Date()}`} />
```