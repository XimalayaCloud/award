import { start } from 'award';
import { RouterSwitch, Route } from 'award-router';
import stateless from './pages/stateless';
import statelessBig from './pages/stateless-big';

start(() => (
  <>
    <RouterSwitch>
      <Route path="/stateless" component={stateless} exact />
      <Route path="/stateless-big" component={statelessBig} exact />
    </RouterSwitch>
  </>
));
