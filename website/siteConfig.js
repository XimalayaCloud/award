/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const times = '?v=' + +new Date();

// List of projects/orgs using your project for the users page
const siteConfig = {
  title: 'Award', // Title for your website.
  tagline: '渐进式web应用框架',
  url: 'https://ximalayacloud.github.io/award/', // Your website URL
  baseUrl: '/award/',
  projectName: 'award-docs',
  organizationName: 'ximalaya',

  scrollToTop: true,
  scrollToTopOptions: {
    zIndex: 100
  },
  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'basic/intro', label: '文档' },
    {
      doc: 'plugin/intro',
      label: '插件'
    },
    { doc: 'api/start', label: 'API' },
    { href: 'https://github.com/XimalayaCloud/award', label: 'GitHub' },
    { href: 'https://www.bilibili.com/video/av82146266', label: '视频' }
  ],

  blogSidebarCount: 'ALL',
  blogSidebarTitle: { default: '最近博客', all: '全部博客' },

  algolia: {
    apiKey: '7d689b8feb15c55f80f2cb5cf393d503',
    indexName: 'ximalaya_award'
  },

  /* path to images for header/footer */
  footerIcon: 'img/favicon.ico',
  favicon: 'img/logo.png',

  /* Colors for website */
  colors: {
    primaryColor: '#f26b00',
    secondaryColor: '#f26b00',
    // primaryColor: 'rgb(34, 34, 34)',
    // secondaryColor: '#05A5D1',
    tintColor: '#005068',
    backgroundColor: '#f5fcff'
  },

  /* Custom fonts for website */

  fonts: {
    myFont: ['Times New Roman', 'Serif'],
    myOtherFont: ['-apple-system', 'system-ui']
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Ximalaya Inc.`,
  usePrism: true,
  highlight: {
    theme: 'default',
    defaultLang: 'javascript'
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    '/award/js/third/buttons.js' + times,
    '/award/js/third/clipboard.js' + times,
    '/award/js/code-block-buttons.js' + times
  ],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  // ogImage: 'img/docusaurus.png',
  // twitterImage: 'img/docusaurus.png',

  // Show documentation's last contributor's name.
  enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

  docsSideNavCollapsible: true

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
};

module.exports = siteConfig;
