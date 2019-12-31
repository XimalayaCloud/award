let setAward: any = null;

// 客户端存储setAward
const set = (_setAward: any) => {
  setAward = _setAward;
};

const get = () => setAward;

export default {
  set,
  get
};
