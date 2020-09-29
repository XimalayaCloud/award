import { mount, configure, ReactWrapper } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const div = document.createElement('div');
div.id = 'award';
document.body.appendChild(div);

const mountStart = (testCallback: (wrapper: ReactWrapper) => void) => {
  const ReactDOM = jest.requireActual('react-dom');
  jest.mock('react-dom', () => ({
    ...ReactDOM,
    render(Component: any, dom: any, callback: Function) {
      const wrapper = mount(Component);
      callback();
      testCallback(wrapper);
    }
  }));
};

it('正常渲染', (done) => {
  process.env.NODE_ENV = 'production';
  process.env.RUN_ENV = 'web';
  window.__INITIAL_STATE__ = {
    award: {}
  };
  mountStart((wrapper) => {
    expect(wrapper.html()).toBe(`<h1>hello world</h1>`);
    history.replaceState({}, 'About', '/about?id=1');
    const warn = jest.spyOn(console, 'warn');
    wrapper.find('h1').at(0).simulate('click');
    wrapper.find('h1').at(0).simulate('click');
    expect(warn).toHaveBeenCalledWith('当前根组件正在执行reloadInitialProps函数，请等待执行完毕！');
    setTimeout(() => {
      expect(wrapper.html()).toBe(`<h1>hello world1</h1>`);
      done();
    }, 0);
  });
  require('@/fixtures/basic/examples/b');
});
