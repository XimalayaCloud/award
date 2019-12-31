const url = '/award_dev_static/';
const source = new EventSource(`${url}_award/style-hmr`);

source.onmessage = function(event) {
  if (event.data == '\uD83D\uDC93') {
    return;
  }
  try {
    processMessage(JSON.parse(event.data));
  } catch (ex) {}
};

const processMessage = (obj: any) => {
  switch (obj.name) {
    case 'project_style_hmr':
      const link: any = document.createElement('link');
      link.href = url + obj.url;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);
      break;
    case 'node_modules_style_hmr':
      const links = Array.from(document.getElementsByTagName('link'));
      const result = JSON.parse(obj.data);
      result.forEach((data: any) => {
        let exist = false;
        let stylePath = '';
        links.forEach((item: any) => {
          if (item.rel && item.rel === 'stylesheet' && item.href) {
            const href = item.href.split('/');
            href.pop();
            stylePath = href.join('/');
            if (item.href.indexOf(data) !== -1) {
              exist = true;
            }
          }
        });
        if (!exist && stylePath) {
          const link: any = document.createElement('link');
          link.href = stylePath + '/' + data;
          link.rel = 'stylesheet';
          link.type = 'text/css';
          document.head.appendChild(link);
        }
      });
      break;
  }
};
