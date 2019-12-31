const div = document.createElement('div');
div.id = 'award';
document.body.appendChild(div);

it('正常渲染', done => {
  jest.mock('react-dom', () => ({
    render() {
      const render = jest.requireActual('react-dom').render;
      render(...arguments);
      const award: any = document.getElementById('award');
      expect(award.innerHTML).toBe('<h1>hello world</h1>');
      done();
    }
  }));
  require('@/fixtures/basic/examples/b');
});
