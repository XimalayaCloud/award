import chalk = require('chalk');

const fn = (info: any) => {
  console.info(chalk.cyan(info));
};

export default fn;
