/* eslint-disable @typescript-eslint/no-namespace */
import { awardHistory } from 'award-utils';

export interface LocationDescriptorObject<S = any> {
  pathname?: string;
  search?: string;
  state?: S;
  hash?: string;
  key?: string;
}

export interface History {
  push: ((path: string, state?: any) => void) & ((location: LocationDescriptorObject<any>) => void);
  replace: ((path: string, state?: any) => void) &
    ((location: LocationDescriptorObject<any>) => void);
  go: (n: number) => void;
  goBack: () => void;
  goForward: () => void;
}

/**
 * 自定义history API
 *
 * push、replace、go、goBack、goForward
 */
const history: History = {
  push(...rest: any) {
    const history: any = awardHistory.getHistory();
    history.push(...rest);
  },
  replace(...rest: any) {
    const history: any = awardHistory.getHistory();
    history.replace(...rest);
  },
  go(n: number) {
    const history: any = awardHistory.getHistory();
    history.go(n);
  },
  goBack() {
    const history: any = awardHistory.getHistory();
    history.goBack();
  },
  goForward() {
    const history: any = awardHistory.getHistory();
    history.goForward();
  }
};

export default history;
