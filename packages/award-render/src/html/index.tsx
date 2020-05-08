import * as React from 'react';
import nodePlugin from 'award-plugin/node';
import { renderToString } from 'react-dom/server';
import { htmlescape } from 'award-utils/server';
import { IContext } from 'award-types';
import * as path from 'path';
import * as fs from 'fs-extra';
import Structure from './structure';

const cwd = process.cwd();
const filename = path.join(cwd, '.award/.awardConfig/react-loadable.json');
let prodStats: any = null;
if (fs.existsSync(filename)) {
  prodStats = JSON.parse(fs.readFileSync(filename, 'utf-8'));
}
interface DocumentProps {
  Head: React.ElementType;
  Html: React.ElementType;
  Script: React.ElementType;
  assetPrefixs: string;
  context: IContext;
}

class DefaultDocument extends React.Component<DocumentProps> {
  public render() {
    const { Head, Html, Script } = this.props;
    return (
      <html>
        <head>
          <Head />
        </head>
        <body>
          <Html />
          <Script />
        </body>
      </html>
    );
  }
}

const RenderComponent = ({ element }: any) => {
  const parse = (ele: any) => {
    if (ele) {
      if (React.isValidElement(ele)) {
        return ele;
      } else {
        const Element = ele;
        return <Element />;
      }
    }
    return ele;
  };
  if (Array.isArray(element)) {
    const eles: any[] = [];
    element.forEach((ele, index) => {
      eles.push(React.cloneElement(parse(ele), { key: index }));
    });
    return eles;
  } else {
    return parse(element);
  }
};

interface Idoc {
  head: any;
  script: any;
  initialState: any;
  assetPrefixs: string;
}

/**
 * ctx 上下文
 *
 * renderReactToString 渲染react组件的函数，开发环境生效
 */
export default async (
  ctx: IContext,
  doc: Idoc,
  renderReactToString?: Function | null,
  stats = prodStats
) => {
  const { RootDocumentComponent = null } = ctx.award;
  const DocumentComponent: any = RootDocumentComponent || DefaultDocument;
  // 触发渲染前钩子
  await nodePlugin.hooks.beforeRender({ context: ctx });

  // 收集样式，初始化项目html文档
  const { head, script, html, bundleScript } = await Structure(ctx, renderReactToString, stats);

  const docStruct: any = {
    beforeHead: [],
    afterHead: [],
    beforeScript: [],
    afterScript: [],
    beforeHtml: [],
    afterHtml: []
  };

  const handler: ProxyHandler<any> = {
    get(target, key, receiver) {
      // 递归创建并返回
      if (typeof target[key] === 'object' && target[key] !== null) {
        return new Proxy(target[key], handler);
      }
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      docStruct[key].push(value);
      return Reflect.set(target, key, null, receiver);
    },
    deleteProperty() {
      throw new Error('不能删除params.doc的字段');
    }
  };

  const params = {
    context: ctx,
    doc: new Proxy(
      {
        beforeHead: null,
        afterHead: null,
        beforeScript: null,
        afterScript: null,
        beforeHtml: null,
        afterHtml: null
      },
      handler
    )
  };

  // 组装document
  await nodePlugin.hooks.document(params);

  const myDoc: DocumentProps = {
    Head: () => (
      <>
        <meta charSet="utf-8" />
        <RenderComponent element={docStruct.beforeHead} />
        {head}
        {doc.head}
        <RenderComponent element={docStruct.afterHead} />
      </>
    ),
    Html: (props: any) => (
      <>
        <RenderComponent element={docStruct.beforeHtml} />
        {html === '' && props.loading ? (
          <div id="award">
            <RenderComponent element={props.loading} />
          </div>
        ) : (
          <div id="award" dangerouslySetInnerHTML={{ __html: html }} />
        )}
        <RenderComponent element={docStruct.afterHtml} />
      </>
    ),
    Script: () => (
      <>
        <RenderComponent element={docStruct.beforeScript} />
        {/* 服务端数据 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__INITIAL_STATE__ = ${htmlescape(JSON.stringify(doc.initialState))};`
          }}
        />
        {/* 服务端拼接脚本 */}
        {script}
        {doc.script}
        {bundleScript}
        <RenderComponent element={docStruct.afterScript} />
      </>
    ),
    context: ctx,
    assetPrefixs: doc.assetPrefixs
  };

  let data: any = {};
  if (typeof DocumentComponent.getInitialProps === 'function') {
    data = await DocumentComponent.getInitialProps(myDoc);
  }

  // 直出html页面
  const finalHtml =
    '<!DOCTYPE html>' +
    renderToString(
      <>
        <>
          <DocumentComponent {...myDoc} {...data} />
        </>
      </>
    );

  // 触发渲染后钩子
  await nodePlugin.hooks.afterRender({ context: ctx, html: finalHtml });
  return finalHtml;
};
