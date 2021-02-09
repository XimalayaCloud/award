import { generatePath } from 'react-router';
import { MatchedRoute } from 'award-types';

export default async (match_routes: Array<MatchedRoute<{}>>, matchLength: number, url: string) => {
  let redirectUrl = null;
  if (!matchLength) {
    return null;
  }
  // 只关心最后一级路由上的 redirect
  const { match, route } = match_routes[matchLength - 1];

  if (route.redirect) {
    const redirect = route.redirect;

    if (typeof redirect === 'function') {
      redirectUrl = await redirect(url, match);
    } else if (typeof redirect === 'string') {
      redirectUrl = generatePath(redirect, match.params as any);
    }
    if (redirectUrl && redirectUrl !== url) {
      return redirectUrl;
    }
  }

  return null;
};
