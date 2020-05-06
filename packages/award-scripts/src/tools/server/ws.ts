import Server from './server';
import fetch from 'award-fetch';
import WebSocket = require('ws');

export default class WS {
  private ws: any;
  private port: number;

  public constructor(port1: number, port2: number) {
    this.ws = new (WebSocket as any).Server({ port: port1 });
    this.port = Number(port2);
  }

  public start() {
    return new Promise(async (resolve, reject) => {
      try {
        new Server(
          {
            isProxy: true,
            port: this.port,
            apiServer: true
          },
          true
        ).listen();

        this.ws.on('connection', (wss: any) => {
          wss.on('message', (message: any) => {
            if (wss.readyState === 1) {
              const options = JSON.parse(message);
              if (/^http(s)?:|^\/\//.test(options.url)) {
                if (/^\/\//.test(options.url)) {
                  options.url = 'http:' + options.url;
                }
              } else {
                options.url = `http://localhost:${this.port}${options.url}`;
              }
              fetch(options, options.__file__isInterceptorsResponse).then((data: any) => {
                wss.send(JSON.stringify(data));
              });
            }
          });
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
