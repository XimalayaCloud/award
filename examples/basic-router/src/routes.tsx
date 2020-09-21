import { RouterSwitch, Route } from 'award-router';

import Home from './pages/home';
import About from './pages/about';

import Custom from './pages/custom';
import CustomDetail from './pages/custom/detail';
import CustomMore from './pages/custom/more';
import CustomMoreDetail from './pages/custom/more-detail';

<award-style>{`
  span{
    color:tomato;
  }
`}</award-style>;

export default () => (
  <RouterSwitch>
    <Route
      path="/home"
      component={Home}
      __award__spread__="123"
      loading={<p>loading...</p>}
      {...{ a: 2 }}
    />
    <Route path="/search/:keyworld" component={() => <span>搜索页面</span>} />
    <Route
      path="/about"
      component={props => (
        <>
          <h3>this is about page</h3>
          {props.children}
        </>
      )}
    >
      <Route path="/about/:id" component={About} client loading={<p>loading...</p>} />
    </Route>
    <Route path="/custom" component={Custom} exact />
    <Route path="/custom/:id" component={CustomDetail} redirect="/custom/:id/more" chain>
      <Route path="/custom/:id/more/:pid(\\d+)" component={CustomMoreDetail} chain />
      <Route path="/custom/:id/more" component={CustomMore} />
    </Route>
  </RouterSwitch>
);
