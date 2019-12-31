import { HelmetData } from 'react-helmet';

import { IAny } from './util';

export interface IDocument {
  dev: boolean;
  head?: HelmetData;
  basename: string;
  initialState: IAny;
  url: string;
  manifest: IAny;
  assetPrefixs: string;
  publicMap: IAny;
  PageCache: boolean;
  error: boolean;
}

export interface IHead {
  head?: HelmetData;
  publicMap: IAny;
  assetPrefixs: string;
  style: IAny;
}

export interface IHtml {
  headHtml: string;
  html: string;
  scriptHtml: string;
}
