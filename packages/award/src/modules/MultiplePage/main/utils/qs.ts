function decode(input: string) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}

function querystring(query: string) {
  let parser = /([^=?&]+)=?([^&]*)/g;
  const result: any = {};
  let part;

  while ((part = parser.exec(query))) {
    let key = decode(part[1]);
    let value = decode(part[2]);

    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

export default querystring;
