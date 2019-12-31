export default (target: any) => {
  // 改装componentWillUnmount，销毁的时候记录一下
  const next = target.prototype.componentWillUnmount;
  target.prototype.componentWillUnmount = function() {
    if (next) {
      next.call(this, ...arguments);
    }
    this.unmount = true;
  };
  // 对setState的改装，setState查看目前是否已经销毁
  const setState = target.prototype.setState;
  target.prototype.setState = function() {
    if (this.unmount) {
      return;
    }
    setState.call(this, ...arguments);
  };
};
