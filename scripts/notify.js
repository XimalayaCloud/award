const notifier = require('node-notifier');
const argv = require('minimist')(process.argv.slice(2));
notifier.notify({
  title: argv._[0],
  message: '编译完成'
});
process.exit(0);
