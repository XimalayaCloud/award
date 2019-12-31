let removeAward: Function | null = null;

export default (data: string | Function) => {
  if (process.env.RUN_ENV !== 'web') {
    // 如果发现在服务器上执行该方法，说明有问题
    console.warn('removeAward方法在服务端不生效');
  } else {
    if (typeof data === 'function') {
      removeAward = data;
    } else {
      if (typeof removeAward === 'function') {
        removeAward(data);
      }
    }
  }
};

export const clean = () => {
  removeAward = null;
};
