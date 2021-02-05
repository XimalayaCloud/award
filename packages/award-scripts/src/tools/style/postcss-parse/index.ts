import { spawn } from 'child_process';
import * as path from 'path';
import { loopWhile } from 'deasync';
import { getHashByReference } from '../../tool/createProjectFileHash';
import { memoryFile } from '../../help';
import { watchImagesPath } from '../utils/constant';
import * as fs from 'fs-extra';

const sprites = path.join(process.cwd(), '.es-sprites');

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
