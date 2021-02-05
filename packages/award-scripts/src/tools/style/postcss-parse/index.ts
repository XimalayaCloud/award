import { spawn } from 'child_process';
import * as path from 'path';
import { loopWhile } from 'deasync';
import { getHashByReference } from '../../tool/createProjectFileHash';

export default (state: any) => {
  let wait = true;
  let result = null;
  const child = spawn('node', [path.join(__dirname, './start.js')], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  child.on('message', (d) => {
    result = JSON.parse(d);
    if (result.type) {
      if (result.type === 'getHashByReference') {
        child.send(
          JSON.stringify({
            type: 'bridge',
            name: result.name,
            data: getHashByReference(result.data)
          })
        );
      }
      return;
    }
    const { globalInfo, ...rests } = result.data;
    global.staticSource = globalInfo;

    state.elementSelectors = result.state.elementSelectors;
    state.fonts = result.state.fonts;
    state.images = result.state.images;

    result = rests;

    wait = false;
  });

  child.send(
    JSON.stringify({
      opts: state.opts,
      styles: state.styles,
      styleSourceMap: state.styleSourceMap,
      elementSelectors: state.elementSelectors,
      css: state.css,
      scopeCSS: state.scopeCSS,
      globalCSS: state.globalCSS,
      styleId: state.styleId,
      globalId: state.globalId,
      fonts: state.fonts,
      images: state.images,
      styleCache: state.styleCache,
      file: {
        opts: state?.file?.opts
      },
      globalInfo: global.staticSource
    })
  );
  loopWhile(() => wait);

  return result;
};
