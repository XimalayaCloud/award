import * as path from 'path';
import getGitUser from './git-user';
import validateName = require('validate-npm-package-name');
import * as fs from 'fs-extra';

const getMetadata = (dir: any) => {
  const filename = path.join(dir, 'index.js');
  let opts = {};

  if (fs.existsSync(filename)) {
    const req = require(path.resolve(filename));
    if (req !== Object(req)) {
      throw new Error('meta.js needs to expose an object');
    }
    opts = req;
  }

  return opts;
};

const setDefault = (opts: any, key: any, val: any, message: string) => {
  if (opts.schema) {
    opts.prompts = opts.schema;
    delete opts.schema;
  }
  const prompts = opts.prompts || (opts.prompts = {});
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      type: 'string',
      message,
      default: val
    };
  } else {
    prompts[key].default = val;
  }
};

const setValidateName = (opts: any) => {
  const name = opts.prompts.name;
  const customValidate = name.validate;
  name.validate = (name: any) => {
    const its = validateName(name);
    if (!its.validForNewPackages) {
      const errors = (its.errors || []).concat(its.warnings || []);
      return 'Sorry, ' + errors.join(' and ') + '.';
    }
    if (typeof customValidate === 'function') {
      return customValidate(name);
    }
    return true;
  };
};

export default function getOptions(name: any, dir: any) {
  const opts = getMetadata(dir);

  setDefault(opts, 'name', name, '项目名称');
  setValidateName(opts);

  const author = getGitUser();
  if (author) {
    setDefault(opts, 'author', author, '开发者');
  }

  return opts;
}
