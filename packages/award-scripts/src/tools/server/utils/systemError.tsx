import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import { Helmet as Head } from 'react-helmet';
import * as _ from 'lodash';
import ansiHTML = require('ansi-html');
import AnsiParser = require('ansi-parser');

const styles: any = {
  errorDebug: {
    background: '#0e0d0d',
    boxSizing: 'border-box',
    overflow: 'auto',
    padding: '24px',
    position: 'fixed',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999
  },

  stack: {
    fontFamily: '"SF Mono", "Roboto Mono", "Fira Mono", consolas, menlo-regular, monospace',
    fontSize: '13px',
    lineHeight: '18px',
    color: '#b3adac',
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    marginTop: '16px'
  },

  heading: {
    fontFamily:
      '-apple-system, system-ui, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
    fontSize: '20px',
    fontWeight: '400',
    lineHeight: '28px',
    color: '#fff',
    marginBottom: '0px',
    marginTop: '0px'
  }
};
const StackTrace = ({ error, error: { name, message, stack } }: any) => (
  <div>
    <pre style={styles.stack}>
      {stack
        ? AnsiParser.removeAnsi(stack)
        : message ||
          name ||
          (_.isError(error)
            ? null
            : _.isObject(error)
            ? JSON.stringify(error)
            : _.isString(error)
            ? error
            : null)}
    </pre>
  </div>
);

const encodeHtml = (str: any) => {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

ansiHTML.setColors({
  reset: ['6F6767', '0e0d0d'],
  darkgrey: '6F6767',
  yellow: '6F6767',
  green: 'ebe7e5',
  magenta: 'ebe7e5',
  blue: 'ebe7e5',
  cyan: 'ebe7e5',
  red: 'ff001f'
});

/**
 * 开发环境统一抛出友好的错误页到前端展示
 */
const ErrorComponent = ({ error, error: { name, message, module } }: any) => (
  <div style={styles.errorDebug}>
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
    <h5 style={{ color: '#4d87ec', fontSize: '20px' }}>
      在开发模式下才会出现该页面，需要进行如下设置，将会渲染您设置的自定义错误组件
      <br />
      <ul>
        <li>
          通过 &#39; award dev &#39; 启动时，需要添加&nbsp;&nbsp;
          <b style={{ color: '#fff', fontSize: '22px' }}>-i</b>&nbsp;&nbsp;即 &#39;
          <strong style={{ color: '#fff' }}> award dev -i </strong> &#39;
        </li>
        <li>
          通过 &#39; node server.js dev &#39; 启动时，需要进行如下设置
          <code>
            <pre style={{ margin: '0 0 30px 0' }}>{`
new Server({
  ignore: true
})`}</pre>
          </code>
        </li>
        <li>
          <a
            style={{ color: '#fff' }}
            href="http://openact.ximalaya.com/award/docs/basic/error/"
            target="_blank"
          >
            更多错误处理介绍，请点击查看文档
          </a>
        </li>
      </ul>
    </h5>
    {module ? <h1 style={styles.heading}>Error in {module.rawRequest}</h1> : null}
    {name === 'ModuleBuildError' ? (
      <pre
        style={styles.stack}
        dangerouslySetInnerHTML={{
          __html: message ? ansiHTML(encodeHtml(message)) : ''
        }}
      />
    ) : (
      <StackTrace error={error} />
    )}
  </div>
);

const ErrorDocument = ({ head, html }: any) => (
  <html>
    <head>{head.meta.toComponent()}</head>
    <body>
      <div id="root" dangerouslySetInnerHTML={{ __html: html }} />
    </body>
  </html>
);

export default (error: any) => {
  const errorhtml = ReactDOMServer.renderToString(<ErrorComponent error={error} />);
  const head = Head.renderStatic();
  const html = ReactDOMServer.renderToString(<ErrorDocument head={head} html={errorhtml} />);

  return '<!DOCTYPE html>' + html;
};
