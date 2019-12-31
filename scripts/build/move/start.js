const prettier = require('../../shared/prettier');

process.on('message', data => {
  prettier(data, true);
  process.exit();
});
