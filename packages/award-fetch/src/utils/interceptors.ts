export const interceptors: {
  request: Function[];
  response: Function[];
} = {
  request: [],
  response: []
};

export const clean = () => {
  if (process.env.NODE_ENV === 'development') {
    if (global.ServerHmr) {
      interceptors.request = [];
      interceptors.response = [];
    }
  }
};
