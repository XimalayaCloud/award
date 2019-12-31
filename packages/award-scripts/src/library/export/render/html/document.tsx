import * as React from 'react';
import { getIPAdress } from 'award-utils/server';

const AwardScript = ({ map, manifest, assetPrefixs, hashName, externalHtml }: any) => {
  const main = map.main ? map.main.replace(/\.css$/, '') : null;
  return (
    <>
      {!hashName && externalHtml && `<!-- 下面是预编译的其他path的html结构 -->`}
      {externalHtml && <div dangerouslySetInnerHTML={{ __html: externalHtml }} />}
      {!hashName && `<!-- 请在.js后面添加版本戳，例如：common.js?v=20181001 -->`}
      <script src={`${assetPrefixs}scripts/${map['common.js']}`} />
      {hashName ? (
        <script dangerouslySetInnerHTML={{ __html: `${manifest}` }} />
      ) : (
        <script src={`${assetPrefixs}scripts/manifest.js`} />
      )}
      {main && <script src={`${assetPrefixs}scripts/${hashName ? main : 'main'}.js`} />}
    </>
  );
};

const AwardHead = ({ port }: any) => {
  return (
    <>
      {port && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.AwardWebSocket = new WebSocket('ws://${getIPAdress()}:${port}');window.AwardWebSocket.onopen = function (e) {console.info('已经连接到ws服务');}`
          }}
        />
      )}
    </>
  );
};

/**
 * 单页应用入口html
 */
export default (props: any) => ({
  head: <AwardHead {...props} />,
  initialState: props.initialState,
  script: <AwardScript {...props} />,
  assetPrefixs: props.assetPrefixs
});
