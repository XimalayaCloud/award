import { sync as rm } from 'rimraf';
import * as path from 'path';
rm(path.join(process.cwd(), '.node_modules'));
