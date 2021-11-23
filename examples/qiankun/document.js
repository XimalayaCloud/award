// document.js
export default class extends React.Component {
  render() {
    // 这是Award核心内容
    const { Head, Html, Script } = this.props;
    return (
      <html>
        <head>
          <Head />
        </head>
        <body>
          <div id="root">
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#fff'
              }}
            >
              <img
                src="//fdfs.xmcdn.com/group74/M03/BE/D0/wKgO0l50Yd_B2eatAAA8Nq3BrQs681.gif"
                style={{
                  width: '300px'
                }}
              />
            </div>
          </div>
          <Script />
        </body>
      </html>
    );
  }
}
