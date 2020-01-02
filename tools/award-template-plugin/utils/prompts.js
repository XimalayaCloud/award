module.exports = {
  name: {
    type: 'string',
    required: true,
    message: '请输入插件名称，请不要以award-plugin-开头，同时插件名称直接用中横杠隔开'
  },
  description: {
    type: 'string',
    required: false,
    message: '项目描述',
    default: '一个Award框架的插件'
  },
  author: {
    type: 'string',
    message: '开发者'
  },
  autoInstall: {
    type: 'list',
    message: '请选择安装方式',
    choices: [
      {
        name: '使用yarn安装 (推荐)',
        value: 'yarn'
      },
      {
        name: '使用npm安装',
        value: 'npm'
      },
      {
        name: '我要自己安装',
        value: false
      }
    ]
  }
};
