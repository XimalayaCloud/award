import * as React from 'react';
import { Link } from 'react-router-dom';
import { RouterSwitch, Route } from 'award-router';

const List = () => {
  return <p>loading...</p>;
};

const TingPage = (props) => {
  return (
    <div>
      <Link to="/ting/abc">/ting/abc</Link>
      <br />
      <Link to="/ting/efg">/ting/efg</Link>
      <br />
      <Link to="/ting/hij">/ting/hij</Link>
      <br />
      <Link to="/ting/klm">/ting/klm</Link>
      <br />
      {props.children}
    </div>
  );
};

TingPage.getInitialProps = (ctx) => {
  console.log('TingPage', ctx);
};

const TingSubContentPage = () => {
  return <h1>hello ting</h1>;
};

const TingSubCategoryPage = (props) => {
  return <h1>hello ting-category - {props.category}</h1>;
};

TingSubCategoryPage.getInitialProps = (ctx) => {
  return {
    category: ctx.match.params.category
  };
};

const Home1 = (props) => {
  return (
    <>
      <h1>hello home</h1>
      <Link to="/home">/home</Link>
      <br />
      <Link to="/home/abc">/home/abc</Link>
      <br />
      <Link to="/home/efg">/home/efg</Link>
      <br />
      <Link to="/home/hij">/home/hij</Link>
      <br />
      <Link to="/home/klm">/home/klm</Link>
      <br />
      {props.children}
    </>
  );
};

const Home2 = (props) => {
  return <h1>hello home2 - {props.id}</h1>;
};

Home2.getInitialProps = (ctx) => {
  return {
    id: ctx.match.params.id
  };
};

const Routes = () => (
  <RouterSwitch>
    <Route path="/home" component={Home1}>
      <Route path="/home/:id?" component={Home2} />
    </Route>
    <Route
      loading={List}
      exact
      path="/ting/:category([a-zA-Z]*)?/:pageNo(p\\d+)?/"
      component={TingPage}
      meta={{ type: 'TING_MAIN', pageName: 'subjectHome' }}
    >
      <Route
        path="/ting"
        exact
        component={TingSubContentPage}
        meta={{ type: 'TING_MAIN', pageName: 'subjectHome' }}
      />
      <Route
        path="/ting/:category([a-z]*)?/:pageNo(p\\d+)?/"
        exact
        component={TingSubCategoryPage}
        meta={{ type: 'TING_CATEGORY', pageName: 'subjectHome' }}
      />
    </Route>
  </RouterSwitch>
);

export default Routes;
