module.exports = (router, controller) => {
  router.post('/api/upload', controller.index.upload);
  router.get('/api/list', controller.index.list);
};
