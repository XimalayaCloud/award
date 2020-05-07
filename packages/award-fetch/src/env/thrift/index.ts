import thrift from './thrift';
import { IOptthrift } from '../../interfaces/fetchOptions';

module.exports = (options: IOptthrift, thriftUtils: any) => {
  return thrift(options, thriftUtils);
};
