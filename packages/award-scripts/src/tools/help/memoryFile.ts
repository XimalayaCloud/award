import MemoryFileSystem = require('memory-fs');

const fs = new MemoryFileSystem();

fs.mkdirpSync('/es-style');
fs.mkdirpSync('/static');
fs.mkdirSync('/react-loadable');

export default fs;
