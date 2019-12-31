export default class EventEmitter {
  public listeners = {};

  public on(this: any, event: string, cb: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }

    if (this.listeners[event].has(cb)) {
      throw new Error(`The listener already exising in event: ${event}`);
    }

    this.listeners[event].add(cb);
  }

  public emit(this: any, event: any, ...data: any[]): any {
    if (!this.listeners[event]) {
      return false;
    }
    return this.listeners[event].forEach((cb: Function) => cb(...data));
  }

  public exist(this: any, event: any): boolean {
    if (!this.listeners[event]) {
      return false;
    }
    return true;
  }

  public off(this: any, event: any) {
    delete this.listeners[event];
  }
}
