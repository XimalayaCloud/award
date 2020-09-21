import * as React from 'react';
import { mount, configure, ReactWrapper } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

type ImountStart = (callback: (wrapper: ReactWrapper, error?: any) => void) => void;

export const start = (testCallback: Function) => {
  const ReactDOM = jest.requireActual('react-dom');
  jest.dontMock('award');
  jest.mock('react-dom', () => ({
    ...ReactDOM,
    render() {
      const callback = arguments[2];
      arguments[2] = () => {
        callback();
        testCallback();
      };
      ReactDOM.render(...arguments);
    }
  }));
};

export const mountStart: ImountStart = (
  testCallback: (wrapper: ReactWrapper, error?: any) => void
) => {
  const ReactDOM = jest.requireActual('react-dom');
  const award = jest.requireActual('award');
  jest.dontMock('award');
  if (process.env.NODE_ENV === 'development') {
    jest.doMock('award', () => ({
      ...award,
      start() {
        award.start(...arguments)((): any => null);
      }
    }));
  }
  jest.mock('react-dom', () => ({
    ...ReactDOM,
    render(Component: any, dom: any, callback: Function) {
      let wrapper = mount(<></>);
      let error = null;
      try {
        wrapper = mount(Component);
      } catch (err) {
        error = err;
      }
      callback();
      testCallback(wrapper, error);
    }
  }));
};

export const createDOM = () => {
  if (!document.getElementById('award')) {
    const div = document.createElement('div');
    div.id = 'award';
    document.body.appendChild(div);
  } else {
    (document.getElementById('award') as any).innerHTML = '';
  }
};

export const removeDOM = () => {
  const award: any = document.getElementById('award');
  if (award) {
    award.remove();
  }
};
