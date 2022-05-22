// 04-copy-directory/index.js

const path = require('path');

const DirSync = require('./dir-sync');

const dirSync = new DirSync(path.join(__dirname, 'files'));
dirSync.syncDir(path.join(__dirname, 'files-copy'));

//__EOF__
