/* eslint-disable @typescript-eslint/no-invalid-this */
import * as React from 'react';
import { mount, configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

class Test extends React.Component {
  public state = {
    count: 1
  };

  public click = () => {
    setTimeout(() => {
      console.log('hello world');
      this.setState({
        count: 2
      });
      setTimeout(() => {
        this.setState({
          count: 3
        });
        setTimeout(() => {
          this.setState({
            count: 4
          });
        }, 20);
      }, 30);
    }, 0);
  };
  public render() {
    return <h1 onClick={this.click}>{this.state.count}</h1>;
  }
}

it('componentDidMount setTimeout', () => {
  jest.useFakeTimers();
  const client = mount(<Test />);
  client.find('h1').at(0).simulate('click');
  jest.runAllTimers();
  expect(client.html()).toBe('<h1>4</h1>');
});
