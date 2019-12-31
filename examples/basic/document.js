// document.js
export default class extends React.Component {
  render() {
    // 这是Award核心内容
    const { Head, Html, Script, assetPrefixs } = this.props;
    return (
      <html>
        <head>
          <Head />
        </head>
        <body>
          <Html />
          <script src={assetPrefixs + `external/a.js?v=${+new Date()}`} />
          {/* 可以自定义添加你的代码 */}
          <Script />
        </body>
      </html>
    );
  }
}
