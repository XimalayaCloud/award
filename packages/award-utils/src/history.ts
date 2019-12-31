let history = false;

// 客户端存储history对象
const storeHistory = (_history: any) => {
  history = _history;
};

const getHistory = () => history;

export default {
  storeHistory,
  getHistory
};
