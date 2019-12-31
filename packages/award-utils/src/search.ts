/* eslint-disable no-param-reassign */
const search = () => {
  let _search;
  if (process.env.ROUTER === 'hash') {
    let { hash } = window.location;
    hash = hash.replace('#', '');
    _search = hash.split('?')[1] || '';
  } else {
    _search = window.location.search.substr(1);
  }
  return _search;
};

export default search;

function decode(input: string) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return '';
  }
}

export const queryObj = (searchInfo: any = null) => {
  const query: { [key: string]: string } = {};
  if (searchInfo === null) {
    searchInfo = search();
  }
  if (searchInfo) {
    searchInfo.split('&').forEach((item: any) => {
      const itemArr: string[] = item.split('=');
      query[itemArr[0]] = decode(itemArr[1]);
    });
  }
  return query;
};
