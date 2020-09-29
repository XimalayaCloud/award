import * as React from 'react';
import AwardContext from 'award-utils/AwardContext';
import setAwardActions from 'award-utils/setAward';
import { IinitState, AComponentType } from 'award-types';

import setAward, { clean } from '../../setAward';
import removeAward, { clean as cleanRemove } from '../../removeAward';

let hmrAwardValue: any = {};

const Abort = (RootComponent: AComponentType) =>
  class AwardAbort extends React.Component {
    public shouldComponentUpdate() {
      return false;
    }

    public render() {
      return <RootComponent />;
    }
  };

/**
 * 创建两个context, 后续combineContextType
 * @param AwardContext this.state.award
 */
export default ({
  Component,
  INITIAL_STATE
}: {
  Component: AComponentType;
  INITIAL_STATE: IinitState;
}) => {
  // Provider层禁用渲染
  const AbortComponent = Abort(Component);

  return class Award extends React.Component<any, any> {
    public constructor(props: any) {
      super(props);
      let pass = true;
      if (process.env.NODE_ENV === 'development') {
        if (window.award_hmr) {
          pass = false;
        }
      }
      if (pass) {
        hmrAwardValue = INITIAL_STATE.award;
      }
      this.state = {
        award: hmrAwardValue
      };

      if (process.env.RUN_ENV === 'web') {
        if (process.env.NODE_ENV === 'development') {
          if (window.award_hmr) {
            clean();
            cleanRemove();
          }
        }
        this.setAward = this.setAward.bind(this);

        setAwardActions.set(this.setAward);
        setAward(this.setAward);

        removeAward(this.removeAward.bind(this));
      }
    }

    public componentDidMount() {
      if (process.env.NODE_ENV === 'development') {
        if (window.award_hmr) {
          console.info('移除award_hmr');
          delete (window as any).award_hmr;
        }
      }
    }

    /**
     * this.setAward({'name':2})
     */
    public setAward(obj: Object = {}): Promise<any> | any {
      if (obj.constructor === Object && Object.keys(obj).length) {
        hmrAwardValue = {
          ...this.state.award,
          ...obj
        };
        // 处理异步更新状态
        return new Promise((resolve) => {
          this.setState(
            {
              award: hmrAwardValue
            },
            () => {
              setTimeout(resolve, 0);
            }
          );
        });
      } else {
        console.warn('setAward必须接受一个不为空的对象');
      }
    }

    /**
     * this.removeAward('name')
     */
    public removeAward(key: string) {
      if (this.state.award[key]) {
        delete this.state.award[key];
        this.setState({ award: { ...this.state.award } });
      } else {
        console.warn(`removeAward移除的【${key}】不存在`);
      }
    }

    public render() {
      return (
        <AwardContext.Provider value={this.state.award}>
          <AbortComponent />
        </AwardContext.Provider>
      );
    }
  };
};
