import ServerFetch from './server';
module.exports = (option: any, isInterceptorsResponse: boolean) => {
  return ServerFetch(option, isInterceptorsResponse);
};
