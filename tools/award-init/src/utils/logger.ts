import chalk from 'chalk';
import { format } from 'util';

const sep = (chalk as any).gray('·');

export const log = (...args: any[]) => {
  const msg = format.apply(format, args);
  console.log(sep, msg);
};

export const fatal = (...args: any[]) => {
  if (args[0] instanceof Error) {
    args[0] = args[0].message.trim();
  }
  const msg = format.apply(format, args);
  console.error(sep, msg);
  process.exit(1);
};

export const success = (...args: any[]) => {
  const msg = format.apply(format, args);
  console.log(sep, msg);
};
