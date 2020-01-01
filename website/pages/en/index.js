/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

// const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = '' } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <div>
        <h2 className="projectTitle">
          {siteConfig.title}
          <small>{siteConfig.tagline}</small>
        </h2>
        <p>
          <a
            className="append-right-8"
            href="https://www.npmjs.com/package/award"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt="Project badge"
              aria-hidden="true"
              className="project-badge"
              src="https://img.shields.io/badge/license-MIT-blue.svg"
            />
          </a>
          <a
            className="append-right-8 award_badge"
            href="https://www.npmjs.com/package/award"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt="Project badge"
              aria-hidden="true"
              className="project-badge"
              src="https://img.shields.io/npm/v/award.svg"
            />
          </a>
          <a href="https://www.npmjs.com/package/award" target="_blank" className="award_badge">
            <img alt="download" src="https://img.shields.io/npm/dm/award.svg" />
          </a>
          <a href="https://lerna.js.org/" target="_blank" className="award_badge">
            <img
              alt="lerna"
              src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg"
            />
          </a>
        </p>
      </div>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <a
            href="https://codesandbox.io/s/awardhello-world-0y1fi?fontsize=14&hidenavigation=1&theme=dark"
            target="_blank"
          >
            <img
              alt="Edit Award@hello-world"
              className="codesandbox"
              src="https://codesandbox.io/static/img/play-codesandbox.svg"
            />
          </a>
          <PromoSection>
            <Button href="docs/basic/intro">Try It Out</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props;
    const { baseUrl } = siteConfig;

    const Block = props => (
      <Container padding={['bottom', 'top']} id={props.id} background={props.background}>
        <GridBlock align="center" contents={props.children} layout={props.layout} />
      </Container>
    );

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content: '基于react框架，支持服务端渲染和单页应用',
            image: `${baseUrl}img/1.jpg`,
            imageAlign: 'top',
            title: '场景'
          },
          {
            content: '开发者只需要关注组件和中间件的开发即可，其他就交给award吧',
            image: `${baseUrl}img/2.jpg`,
            imageAlign: 'top',
            title: '开箱即用'
          },
          {
            content: '提供了丰富且强大的插件系统，让开发者在Award的生态里自由的翱翔',
            image: `${baseUrl}img/3.svg`,
            imageAlign: 'top',
            title: '插件'
          }
        ]}
      </Block>
    );

    const FeatureCallout = () => (
      <div
        className="productShowcaseSection"
        style={{ textAlign: 'center', paddingBottom: '40px' }}
      >
        <h2>应用案例</h2>
      </div>
    );

    const data = [
      {
        url: 'https://www.ximalaya.com/',
        img: `${baseUrl}img/app/1.png`,
        title: '喜马拉雅主站'
      },
      {
        url: 'https://m.ximalaya.com/',
        img: `${baseUrl}img/app/2.png`,
        title: '喜马拉雅m站'
      },
      {
        url: 'https://www.himalaya.com/',
        img: `${baseUrl}img/app/3.png`,
        title: '喜马拉雅国际站'
      },
      {
        url: 'https://mall.ximalaya.com/ximall/index/home',
        img: `${baseUrl}img/app/4.png`,
        title: '喜马拉雅万物声商城'
      },
      {
        url: 'http://m.ximalaya.com/quanzi/9',
        img: `${baseUrl}img/app/5.png`,
        title: '喜马拉雅圈子'
      },
      {
        url: 'http://yingxiao.ximalaya.com/',
        img: `${baseUrl}img/app/6.png`,
        title: '喜马拉雅广告投放'
      }
    ];

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          <div className="__app__">
            {data.map((i, index) => {
              if (index % 3 === 0) {
                const _data = [data[index]];
                if (data[index + 1]) {
                  _data.push(data[index + 1]);
                }

                if (data[index + 2]) {
                  _data.push(data[index + 2]);
                }
                return (
                  <div className="__app__item__" key={index}>
                    {_data.map((item, i) => {
                      return (
                        <a href={item.url} target="__blank" key={i} title={item.title}>
                          <img src={item.img} />
                        </a>
                      );
                    })}
                  </div>
                );
              }
            })}
          </div>
          <p style={{ textAlign: 'center', lineHeight: '0px', fontSize: '40px' }}>......</p>
        </div>
      </div>
    );
  }
}

module.exports = Index;
