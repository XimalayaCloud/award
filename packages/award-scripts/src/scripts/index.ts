import * as commander from 'commander';
import build from './build';
import dev from './dev';
import start from './start';
import exportProject from './export';
import info from './info';
import umd from './umd';

export default () => {
  const pkg = require('../../package.json');

  commander.version(pkg.version).usage('<command> [options]').option('--inspect');

  const defaultOptParser = (val: any) => val;

  [dev, build, start, exportProject, info, umd].forEach((command: any) => {
    const options = command.options || [];
    const ons = command.ons || [];

    const cmd = commander.command(command.command).description(command.description);

    if (command.action) {
      cmd.action(command.action);
    }

    options.forEach((opt: any) => {
      cmd.option(
        opt.command,
        opt.description,
        opt.parse || defaultOptParser,
        typeof opt.default === 'function' ? opt.default() : opt.default
      );
    });

    ons.forEach((on: any) => {
      cmd.on(on.name, on.fun);
    });
  });

  commander.parse(process.argv);
};
