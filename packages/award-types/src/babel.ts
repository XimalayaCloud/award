export interface IBabelrc {
  presets?: string[];
  plugins?: any[];
  env?: {
    production?: {
      plugins?: any[];
    };
    test?: {
      plugins?: any[];
    };
  };
}
