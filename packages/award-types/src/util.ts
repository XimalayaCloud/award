export interface IAny {
  [props: string]: any;
}

export interface ITextObj {
  [keys: string]: string;
}

export interface ScrollObject {
  x: number;
  y: number;
  scroll: boolean;
}
