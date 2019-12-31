import { getAwardConfig } from 'award-utils/server';
import * as zookeeper from 'node-zookeeper-client';
import * as apiGatewayConfig from '../config/apiGateway';
import log from './log';

class APIGateway {
  private index = 0;
  private servers: string[] = [];
  private INNER_SOUTHGATE?: string;
  private PATH: string;
  private config: any;

  public constructor(inner_southgate?: string) {
    this.INNER_SOUTHGATE = inner_southgate;
    const { fetch: fetchConfig }: any = getAwardConfig();

    Object.assign(apiGatewayConfig, fetchConfig && fetchConfig.apiGateway);

    const {
      PATH,
      INNER_SOUTHGATE
    }: {
      PATH: string;
      INNER_SOUTHGATE: string;
    } = apiGatewayConfig;
    this.config = apiGatewayConfig;
    this.INNER_SOUTHGATE = this.INNER_SOUTHGATE || INNER_SOUTHGATE;
    this.PATH = PATH;
  }

  public getApiServer(path?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.servers && this.servers.length > 0) {
        resolve(this.pickServer());
      } else {
        if (this.INNER_SOUTHGATE) {
          const zkClient = zookeeper.createClient(this.INNER_SOUTHGATE);

          if (this.config.digestAuth) {
            zkClient.addAuthInfo('digest', Buffer.from(this.config.digestAuth));
          }

          let state = false;
          zkClient.on('state', (st: any) => {
            if (st === zookeeper.State.SYNC_CONNECTED) {
              state = true;
              console.info('Client state is changed to connected.');
            }
          });

          zkClient.once('connected', () => {
            console.info('[APIGateWay]Connected to ZooKeeper.');
            this.listChildren(zkClient, resolve, reject, path);
          });

          zkClient.connect();

          setTimeout(() => {
            if (!state) {
              reject(new Error('zkClient contented fail'));
            }
          }, 3000);
        } else {
          reject(new Error('zkClient contented fail'));
        }
      }
    });
  }

  private listChildren(
    client: any,
    resolve: Function | null,
    reject: Function | null,
    tpath?: string
  ) {
    const path = tpath || this.PATH;
    console.info('[apiGateway getChildren] start.');
    client.getChildren(
      path,
      (event: any) => {
        console.info('[apiGateway update]Got watcher event: %s', event);
        this.listChildren(client, null, null, tpath);
      },
      (error: any, children: string[]) => {
        if (error) {
          log.error(`Failed to list children of ${path} due to: ${error}.`, 'APIGateWay');
          if (reject) {
            reject('[APIGateWay]Failed to list children');
          }
        } else {
          this.servers = children;
          this.index = 0;
          console.info('[APIGateWay]API Gateway Server loaded', children);
          if (resolve) {
            resolve(this.pickServer());
          }
        }
      }
    );
  }

  private pickServer(): string {
    if (this.servers == null || this.servers.length === 0) {
      log.error('No API gateway instance is avaliable.', 'APIGateWay');
    }
    // Round Robin
    const result = this.servers[this.index];
    this.index++;
    if (this.index >= this.servers.length) {
      this.index = 0;
    }
    return result;
  }
}

export default APIGateway;
