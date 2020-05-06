import clientPlugin from 'award-plugin/client';

let customLog: {
  error: Function;
};

const error = (msg: string | Error, type = '', ...args: string[]) => {
  if (process.env.RUN_ENV === 'web') {
    clientPlugin.hooks.catchError({
      type: 'fetch',
      error: msg instanceof Error ? msg : new Error(msg)
    });
  }
  if (customLog && customLog.error) {
    return customLog.error(msg, type, ...args);
  }
  console.error(`${type ? `[${type}]: ` : ''}${msg}`);
};

export default {
  error
};

export function set(log: { error: Function }) {
  customLog = log;
}
