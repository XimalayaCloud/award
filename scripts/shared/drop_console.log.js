/**
 * 移除可执行的console.log代码
 */
module.exports = function() {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.object && path.node.callee.object.name === 'console') {
          if (path.node.callee.property && path.node.callee.property.name === 'log') {
            path.remove();
          }
        }
      }
    }
  };
};
