let customLog: {
  error: Function;
};

const error = (msg: string | Error, type = '', ...args: string[]) => {
  if (customLog && customLog.error) {
    return customLog.error(msg, type, ...args);
  }
  if (type) {
    console.error(`[${type}]:`);
  }
  console.error(msg);
};

export default {
  error
};

export function set(log: { error: Function }) {
  customLog = log;
}
