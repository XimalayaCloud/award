import * as React from 'react';
import * as fs from 'fs-extra';
import { Helmet as Head } from 'react-helmet';
import nodePlugin from 'award-plugin/node';
import { renderToString } from 'react-dom/server';
import { IContext } from 'award-types';
import { getBundles } from 'react-loadable/webpack';
import * as path from 'path';

const styleModulefile = path.join(process.cwd(), 'node_modules/.cache/award/.moduleStyles.json');

const createStyleLink = (ctx: IContext) => {
  const {
    dev,
    map,
    config: { assetPrefixs, hashName },
    match_routes
  }: any = ctx.award;
  const linkStyle: any = [];
  const css: any = [];
  let i = 0;

  if (!dev) {
    // 存在第三方依赖的静态资源
    if (map.moduleStyles && map.moduleStyles[0]) {
      css.push(map.moduleStyles[0]);
    }
    match_routes.forEach((item: any) => {
      // 读取当前匹配到的chunk样式资源
      const file = item.route.__award__file__;
      if (file) {
        if (map[file]) {
          css.push(map[file]);
        }
        if (map.moduleStyles && map.moduleStyles[file]) {
          css.push(...map.moduleStyles[file]);
        }
      }
    });

    if (map[0]) {
      // 存在公共资源
      linkStyle.push(
        <link
          key={i}
          rel="stylesheet"
          type="text/css"
          href={`${assetPrefixs}styles/${hashName ? map[0] : 'main.css'}`}
        />
      );
      i++;
    }
  } else {
    let moduleStyles: any = {};
    if (fs.existsSync(styleModulefile)) {
      moduleStyles = JSON.parse(fs.readFileSync(styleModulefile, 'utf-8'));
    }
    // 开发环境存在第三方依赖的静态资源
    if (moduleStyles) {
      if (moduleStyles[0]) {
        css.push(moduleStyles[0]);
      }
      match_routes.forEach((item: any) => {
        // 读取当前匹配到的chunk样式资源
        const file = item.route.__award__file__;

        if (file) {
          if (moduleStyles[file]) {
            css.push(...moduleStyles[file]);
          }
        }
      });
    }
  }

  css.forEach((item: any) => {
    linkStyle.push(
      <link key={i} rel="stylesheet" type="text/css" href={`${assetPrefixs}styles/${item}`} />
    );
    i++;
  });
  if (dev) {
    linkStyle.push(
      <link key={i} rel="stylesheet" type="text/css" href={`${assetPrefixs}award.css`} />
    );
  }
  return linkStyle;
};

export default async (ctx: IContext, renderReactToString?: Function | null, stats?: any) => {
  const {
    config: { router, mode, crossOrigin },
    RootComponent
  } = ctx.award;

  let html = '';
  let head = null;
  let bundles = [];
  const params = {
    Component: <RootComponent />,
    context: ctx
  };
  // 触发渲染钩子
  await nodePlugin.hooks.render(params);
  if (renderReactToString) {
    // 可以自定义渲染场景
    const render = await renderReactToString(params.Component, ctx);
    if (render) {
      html = render.html || '';
      head = render.head || null;
      bundles = render.bundles || [];
    }
  } else {
    /**
     * 以下场景，才会把当前组件渲染出来
     * 1. 服务端渲染场景
     * 2. 单页导出
     */
    if (
      RootComponent &&
      ((router === 'browser' && mode === 'server') || process.env.WEB_TYPE === 'WEB_SPA')
    ) {
      html = renderToString(params.Component);
    }

    head = Head.renderStatic();
    bundles = stats ? getBundles(stats, ctx.award.modules) : [];
  }

  let title = null;
  let meta = null;
  let link = null;
  const headScript: any = [];
  const footerScript: any = [];
  const bundleScript: any = [];
  const bundleStyle: any = [];
  if (head && html !== '') {
    link = head.link.toComponent();
    meta = head.meta.toComponent();
    title = head.title.toComponent();
    const script: any = head.script.toComponent();
    script.forEach((item: any) => {
      if (item.props.head) {
        headScript.push(React.cloneElement(item, { head: 'true' }));
      } else {
        footerScript.push(item);
      }
    });
  }

  const cross: any = {};
  if (crossOrigin) {
    cross.crossOrigin = 'anonymous';
  }

  if (bundles.length) {
    bundles.forEach((bundle: any, index: number) => {
      if (/\.js$/.test(bundle.publicPath)) {
        if (!/hot-update\.js/.test(bundle.publicPath)) {
          bundleScript.push(<script {...cross} src={bundle.publicPath} key={index} />);
        }
      } else if (/\.css$/.test(bundle.publicPath)) {
        bundleStyle.push(
          <link key={index} rel="stylesheet" type="text/css" href={bundle.publicPath} />
        );
      }
    });
  }

  return {
    head: (
      <>
        {/** SEO */}
        {title}
        {meta}
        {link}

        {/** 第三方依赖的样式资源，比如antd */}
        {createStyleLink(ctx)}

        {/** 通过依赖拆分，按需加载的bundle样式资源 */}
        {bundleStyle}

        {/** 头部注入的一些简单脚本 */}
        {headScript}
      </>
    ),
    script: footerScript,
    bundleScript,
    html
  };
};
