import chalk from 'chalk';

export default function filterFiles(filter: any): Function {
  return (files: any, metalsmith: any, done: any) => {
    if (!filter || typeof filter !== 'function') {
      return done();
    }
    console.log();
    Object.keys(files).forEach(file => {
      if (filter(file, metalsmith.metadata())) {
        delete files[file];
      } else {
        console.log(`  ${chalk.yellow('create')}    ${file}`);
      }
    });
    console.log();
    done();
  };
}
