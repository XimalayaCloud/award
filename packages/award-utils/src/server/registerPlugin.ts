import { getAwardConfig } from './config';
import nodePlugin from 'award-plugin/node';

export default () => {
  const config = getAwardConfig();

  if (config.plugins?.length) {
    nodePlugin.unregister();
    nodePlugin.register(config.plugins);
  }
};
