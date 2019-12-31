import * as fs from 'fs-extra';
import * as path from 'path';
import * as url from 'url';

function buildManifest(compiler: any, compilation: any) {
  let context = compiler.options.context;
  let manifest: any = {};

  compilation.chunks.forEach((chunk: any) => {
    chunk.files.forEach((file: any) => {
      for (const modules of chunk.modulesIterable) {
        let id = modules.id;
        let name = typeof modules.libIdent === 'function' ? modules.libIdent({ context }) : null;
        let publicPath = url.resolve(compilation.outputOptions.publicPath || '', file);

        let currentModule = modules;
        if (modules.constructor.name === 'ConcatenatedModule') {
          currentModule = modules.rootModule;
        }
        if (!manifest[currentModule.rawRequest]) {
          manifest[currentModule.rawRequest] = [];
        }

        manifest[currentModule.rawRequest].push({ id, name, file, publicPath });
      }
    });
  });

  return manifest;
}

export default class ReactLoadablePlugin {
  private filename: string;
  private fs: any;

  public constructor(opts: any = {}) {
    this.filename = opts.filename;
    this.fs = opts.fs;
  }

  public apply(compiler: any) {
    compiler.hooks.emit.tapAsync('ReactLoadablePlugin', (compilation: any, callback: any) => {
      const manifest = buildManifest(compiler, compilation);
      const json = JSON.stringify(manifest, null, 2);
      let myFs = fs;
      if (!this.fs) {
        const outputDirectory = path.dirname(this.filename);
        try {
          fs.mkdirsSync(outputDirectory);
        } catch (err) {
          if (err.code !== 'EEXIST') {
            throw err;
          }
        }
      } else {
        myFs = this.fs;
      }
      myFs.writeFileSync(this.filename, json);
      callback();
    });
  }
}
