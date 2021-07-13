import { history as RouterHistory } from 'award-router';
import { createLocation } from 'history';
import { loadParams } from 'award-utils';

function hasBasename(path, prefix) {
  return (
    path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 &&
    '/?#'.indexOf(path.charAt(prefix.length)) !== -1
  );
}

function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}

if (top !== self) {
  /**
   * 路由系统全部交给parent管理
   */
  let parentHistory = window.parent.history;
  let localReplaceState = history.replaceState;
  history.pushState = function () {
    if (arguments[0] && arguments[0].state === 'null') {
      return;
    }
    parentHistory.pushState.apply(parentHistory, arguments);
    localReplaceState.apply(history, arguments);
  };
  history.replaceState = function () {
    // console.log('replaceState', arguments);
    parentHistory.replaceState.apply(parentHistory, arguments);
    localReplaceState.apply(history, arguments);
  };
  window.parent.addEventListener('popstate', function (e) {
    // 这里其实路由已经发生变化了，只是react-router的组件没有按照正确的渲染，这里就是要让他进行渲染
    let _ref = e.state || {};
    let key = _ref.key;
    let state = _ref.state;

    let _window$location = window.parent.location;
    let pathname = _window$location.pathname;
    let search = _window$location.search;
    let hash = _window$location.hash;
    let path = pathname + search + hash;
    const { basename } = loadParams.get();
    path = stripBasename(path, basename);
    const location = createLocation(path, state, key);
    localReplaceState.apply(history, ['', '', location.pathname + location.search]);
    RouterHistory.push({
      pathname: location.pathname,
      search: location.search,
      state: 'null'
    });
  });
}

require('./app');
