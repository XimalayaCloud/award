declare module '*.png' {
  const value: string;
  export default value;
}

declare namespace JSX {
  interface IntrinsicElements {
    'award-style': any;
  }
}
