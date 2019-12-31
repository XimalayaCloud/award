import * as React from 'react';
import { start } from 'award';
import app from '../app/b';

start(app, props => <p>{props.message}</p>);
