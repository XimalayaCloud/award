import { regNodeModules } from '../../help';

export default function(babel: any) {
  const { types: t } = babel;

  return {
    visitor: {
      CallExpression(path: any, state: any) {
        const reference = state && state.file && state.file.opts.filename;
        if (regNodeModules.test(reference)) {
          return;
        }
        if (path.node.callee.object && path.node.callee.object.name === 'console') {
          path.replaceWith(t.NullLiteral());
        }
      }
    }
  };
}
