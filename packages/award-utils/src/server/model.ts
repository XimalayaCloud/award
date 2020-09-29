import { Imodel } from 'award-types';
import * as _ from 'lodash';

const models: Imodel[] = [];

const set = (model: Imodel) => {
  if (_.findIndex(models, (m) => m.namespace === model.namespace) === -1) {
    models.push(model);
  }
};

const get = () => models;

export default {
  set,
  get
};
