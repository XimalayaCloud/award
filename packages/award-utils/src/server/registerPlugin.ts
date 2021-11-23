import { getAwardConfig } from './config';
import nodePlugin from 'award-plugin/node';

export default () => {
  const pluginConfig = getAwardConfig();

  if (pluginConfig.plugins?.length) {
    nodePlugin.unregister();
    nodePlugin.register(pluginConfig.plugins);
  }
  getAwardConfig();
};
