import { spawn } from 'child_process';
import * as path from 'path';
import { loopWhile } from 'deasync';
import { getHashByReference } from '../../tool/createProjectFileHash';
import { memoryFile } from '../../help';
import { watchImagesPath } from '../utils/constant';
import * as fs from 'fs-extra';

const sprites = path.join(process.cwd(), '.es-sprites');

const handleStyle = spawn('node', [path.join(__dirname, './start.js')], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc']
});

let id = 0;
let store: any = {};

handleStyle.on('message', (d) => {
  const result = JSON.parse(d);
  if (result.type) {
    // 获取styledId
    if (result.type === 'getHashByReference') {
      handleStyle.send(
        JSON.stringify({
          type: 'bridge',
          name: result.name,
          data: getHashByReference(result.data)
        })
      );
    }
    // 内存写入图片
    if (result.type === 'images') {
      if (!new RegExp(`^${sprites}`).test(result.src)) {
        let map: any = {};
        if (memoryFile.existsSync(watchImagesPath)) {
          const filemap = memoryFile.readFileSync(watchImagesPath, 'utf-8');
          map = JSON.parse(filemap);
        }
        if (map[result.src]) {
          map[result.src].push(result.reference);
        } else {
          map[result.src] = [result.reference];
        }
        memoryFile.writeFileSync(watchImagesPath, JSON.stringify(map));
      }

      if (!memoryFile.existsSync(result.new_dir)) {
        memoryFile.mkdirpSync(result.new_dir);
      }

      const data = fs.readFileSync(result.src);
      memoryFile.writeFileSync(result.outputFile, data);
    }
  } else {
    if (store[result.fromId]) {
      store[result.fromId](result, result.fromId);
    }
  }
});

export default (state: any) => {
  let wait = true;
  let result = null;

  id++;

  store[id] = (responseStore: any, fromId: any) => {
    const { globalInfo, ...rests } = responseStore.data;
    global.staticSource = globalInfo;

    state.elementSelectors = responseStore.state.elementSelectors;
    state.fonts = responseStore.state.fonts;
    state.images = responseStore.state.images;

    result = rests;
    delete store[fromId];
    wait = false;
  };

  handleStyle.send(
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
      globalInfo: global.staticSource,
      fromId: id
    })
  );

  loopWhile(() => wait);

  return result;
};
