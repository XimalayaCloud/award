export const interceptors: {
  request: any;
  response: any;
} = {
  request: [],
  response: []
};

export const clean = (filepath: string) => {
  if (process.env.NODE_ENV === 'development') {
    interceptors.request = interceptors.request.filter((item: any) => {
      if (item.source !== filepath) {
        return true;
      } else {
        return false;
      }
    });
    interceptors.response = interceptors.response.filter((item: any) => {
      if (item.source !== filepath) {
        return true;
      } else {
        return false;
      }
    });
  }
};
