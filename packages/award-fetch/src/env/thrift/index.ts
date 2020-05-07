import thrift from './thrift';
import { IOptthrift } from '../../interfaces/fetchOptions';

module.exports = (options: IOptthrift, thriftUtils: any, isInterceptorsResponse: boolean) => {
  return thrift(options, thriftUtils, isInterceptorsResponse);
};
