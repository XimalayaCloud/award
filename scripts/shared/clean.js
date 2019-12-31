const del = require('del');
const fs = require('fs-extra');

module.exports = dist => {
  // 千万不能把根项目删掉
  try {
    if (fs.existsSync(dist) && dist !== process.cwd()) {
      del.sync(dist, { force: true });
    }
  } catch (error) {}
};
