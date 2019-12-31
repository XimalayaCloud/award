import { prepare } from '../../../tools/tool';

prepare(true, false);

const [assetPrefixs, port] = process.argv.slice(2);
require('./start')(assetPrefixs, port ? Number(port) : null);
