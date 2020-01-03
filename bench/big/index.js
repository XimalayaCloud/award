import { start } from 'award';
import { RouterSwitch, Route } from 'award-router';
import statelessBig from './stateless-big';

start(() => (
  <>
    <RouterSwitch>
      <Route path="/stateless-big" component={statelessBig} exact />
    </RouterSwitch>
  </>
));
