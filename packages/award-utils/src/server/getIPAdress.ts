import { networkInterfaces } from 'os';

const fn = () => {
  const interfaces = networkInterfaces();
  for (const devName of Object.keys(interfaces)) {
    const iface = interfaces[devName];
    for (const i of Object.keys(iface)) {
      const ipInfo = iface[i as any];
      if (ipInfo.family === 'IPv4' && ipInfo.address !== '127.0.0.1' && !ipInfo.internal) {
        return ipInfo.address;
      }
    }
  }
  return null;
};

export default fn;
