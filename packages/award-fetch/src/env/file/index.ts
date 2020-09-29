module.exports = (options: object) => {
  return new Promise((resolve, reject) => {
    (function doSocket(win) {
      const _ws = new WebSocket((win as any).AwardWebSocket.url);
      _ws.onopen = () => {
        _ws.send(JSON.stringify(options));
        _ws.onmessage = (evt) => {
          _ws.close();
          resolve(JSON.parse(evt.data));
        };
        _ws.onerror = (err) => {
          _ws.close();
          reject(err);
        };
      };
    })(window);
  });
};
