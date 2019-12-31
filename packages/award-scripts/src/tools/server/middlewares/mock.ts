/**
 * mock中间件
 */
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { Context } from 'koa';
import * as randomMock from 'mockjs';
import { getAwardConfig } from 'award-utils/server';
import { IContext } from 'award-types';

export interface Err extends Error {
  code?: number;
  statusCode?: number;
}

// root
const mockRoot = path.join(process.cwd(), 'mock');

// handle errors
function error(ctx: Context, err: Err) {
  const code = err.code || err.statusCode;
  console.error('[cgi-mock] %s %s', code, err.message);

  ctx.status = code || 500;
  ctx.type = 'application/json';

  ctx.body = JSON.stringify({
    code: err.code,
    message: err.message
  });
}

// parse request body
const bodyParser = (ctx: Context) => {
  const chunkArr: any[] = [];
  const { req } = ctx;
  let bufLen = 0;

  return new Promise(resolve => {
    req.on('data', chunk => {
      chunkArr.push(chunk);
      bufLen += chunk.length;
    });

    req.on('end', () => {
      const input = Buffer.concat(chunkArr, bufLen).toString();

      try {
        (req as any).data = JSON.parse(input);
      } catch (err) {
        (req as any).data = input;
      }
      resolve();
    });
  });
};

// handler mock file
const handler = (ctx: IContext, filename: string, urlObj: any) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err: any, file: any) => {
      if (err) {
        (err as any).code = 404;
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(err as Err);
      } else {
        try {
          // create mock function from mock file
          // eslint-disable-next-line no-new-func
          const mock = new Function('ctx', 'mock', 'next', file.toString());

          // add query object to req
          (ctx.req as any).query = urlObj.query;

          // run mock
          mock(ctx, randomMock, async (_err: any, data: any) => {
            if (!_err && data != null) {
              if (typeof data === 'function') {
                resolve(JSON.stringify(await data()));
              } else {
                resolve(JSON.stringify(data));
              }
            } else {
              reject(_err);
            }
          });
        } catch (err) {
          reject(err);
        }
      }
    });
  });
};

/**
 * [api mock中间件]
 */
export default function mockMidd() {
  async function mockMiddleware(ctx: IContext, next: Function) {
    const { fetch: fetchConfig = {} } = getAwardConfig();
    const { domainMap = {} } = fetchConfig;

    const apiKeys = Object.keys(domainMap);
    const keys: any[] = [];
    apiKeys.map(key => {
      if (/^\//.test(key)) {
        keys.push(key.replace(/^\//, ''));
      } else {
        keys.push(key);
      }
    });

    // 匹配 /api/...    /keyname/.....
    const regApi = new RegExp(`^\/(${keys.join('|')})\/.`);
    const { req } = ctx;
    if (!regApi.test(req.url || '')) {
      await next();
      return;
    }

    const urlObj = url.parse(req.url || '', true);
    const filename = path.join(mockRoot, urlObj.pathname || '') + '.js';

    if (!fs.existsSync(filename)) {
      await next();
      return;
    }

    console.info('[cgi-mock] %s %s', req.method, req.url);
    if (req.headers.mock) {
      try {
        ctx.body = randomMock.mock(JSON.parse((req.headers as any).mock));
      } catch (e) {
        ctx.body = e;
      }
      return;
    }

    await bodyParser(ctx);
    try {
      const ret = await handler(ctx, filename, urlObj);
      ctx.type = 'application/json';
      ctx.body = ret;
    } catch (e) {
      error(ctx, e);
    }
  }

  return mockMiddleware;
}
