module.exports = {
  projectType: {
    type: 'list',
    message: '项目类型',
    choices: [
      {
        name: '服务端渲染应用',
        value: 'ssr'
      },
      {
        name: '单页应用',
        value: 'spa'
      }
    ]
  },
  jsType: {
    type: 'list',
    message: '语法类型',
    choices: [
      {
        name: 'TypeScript',
        value: 'ts'
      },
      {
        name: 'JavaScript',
        value: 'js'
      }
    ]
  },
  name: {
    type: 'string',
    required: true,
    message: '项目名称'
  },
  description: {
    type: 'string',
    required: false,
    message: '项目描述',
    default: '一个基于Award框架的项目'
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
