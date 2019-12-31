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
    var key = decode(part[1]),
      value = decode(part[2]);

    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

export default querystring;
