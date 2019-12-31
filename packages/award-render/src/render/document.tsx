import * as React from 'react';
import * as fs from 'fs-extra';
import * as path from 'path';

const AwardScript = (props: any) => {
  const {
    dev,
    map,
    error,
    manifest,
    assetPrefixs,
    cache,
    mode,
    hashName,
    router,
    crossOrigin,
    modules
  }: any = props;

  const cross: any = {};

  if (crossOrigin) {
    cross.crossOrigin = 'anonymous';
  }

  const scriptData = [];

  if (dev) {
    const commonJs = path.join(process.cwd(), 'node_modules', '.dll', 'common.js');
    if (fs.existsSync(commonJs)) {
      scriptData.push(<script {...cross} key="0" defer={true} src={`${assetPrefixs}common.js`} />);
    }
  }

  // 服务端渲染、browser形式的路由、未开启缓存、未发生错误
  if (mode === 'server' && router === 'browser' && !cache && !error) {
    scriptData.push(<div key="1" id="__URL__" data-loadable={modules.length} />);
  }

  if (dev) {
    scriptData.push(<script {...cross} defer={true} key="2" src={`${assetPrefixs}award.js`} />);
  } else {
    const main = map.main.replace(/\.css$/, '');
    if (manifest) {
      scriptData.push(<script key="3" dangerouslySetInnerHTML={{ __html: manifest }} />);
    } else if (!hashName) {
      scriptData.push(
        <script {...cross} key="4" defer={true} src={`${assetPrefixs}scripts/manifest.js`} />
      );
    }

    if (map['common.js']) {
      scriptData.push(
        <script
          {...cross}
          key="5"
          defer={true}
          src={`${assetPrefixs}scripts/${map['common.js']}`}
        />
      );
    }
    scriptData.push(
      <script
        {...cross}
        key="6"
        defer={true}
        src={`${assetPrefixs}scripts/${!hashName ? 'main' : main}.js`}
      />
    );
  }
  return <>{scriptData}</>;
};

export default function Document(props: any) {
  return {
    head: null,
    initialState: props.mode === 'server' ? props.initialState : {},
    script: <AwardScript {...props} />,
    assetPrefixs: props.assetPrefixs
  };
}
