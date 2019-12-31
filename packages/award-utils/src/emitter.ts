let emitter: any = null;

interface Iemitter {
  /**
   * 创建监听
   *
   * @param event 监听名称
   * @param cb 监听触发回调
   */
  on(event: string, cb: (...data: any[]) => void): void;

  /**
   * 触发监听
   * @param event 监听名称
   * @param data 传输值
   */
  emit(event: string, ...data: any[]): void;

  /** 移除监听 */
  off(event: string): void;
}

// 客户端存储emmit
const storeEmitter = (emit: any) => {
  emitter = emit;
};

const getEmitter = (): Iemitter => emitter;

export default {
  storeEmitter,
  getEmitter
};
