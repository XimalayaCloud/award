import * as React from 'react';
import { IinitState } from './initstate';
import { Routes } from './routes';

export interface Info {
  Component: typeof React.Component;
  INITIAL_STATE: IinitState;
  routes: Routes;
}
