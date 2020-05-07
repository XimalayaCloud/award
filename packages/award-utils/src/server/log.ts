import getIPAdress from './getIPAdress';
import { isError, isPlainObject } from 'lodash';
import { IMsg } from 'award-types';
import { join } from 'path';

const hostName = require('os').hostname();

const { name: app, version = '1.0.0' }: { name: string; version: string } = require(join(
  process.cwd(),
  'package.json'
));

function mutiLog(msg: any) {
  if (isPlainObject(msg)) {
    for (const key in msg) {
      if (isError(msg[key])) {
        console.info(msg[key]);
      } else {
        console.info(`${key}:${msg[key]}`);
      }
    }
  } else {
    console.error(msg);
  }
}

export default (
  msg: IMsg | string | Error,
  eventType = 'system',
  siteInfo: any,
  logIdentity = version,
  serviceId = 'award'
) => {
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    console.error(`[${eventType}]: ${siteInfo.url}`);
    mutiLog(msg);
    return null;
  }
  return {
    app,
    ip: getIPAdress(),
    hostName,
    timestamp: Number(new Date()),
    serviceId,
    logIdentity,
    eventType,
    level: 'ERROR',
    siteInfo,
    logDetail: isError(msg) ? msg.stack : msg
  };
};
