// 05-merge-styles/index.js

const path = require('path');

const StyleMerger = require('./style-merger');

const styleMerger = new StyleMerger(path.join(__dirname, 'styles'));
styleMerger.merge(path.join(__dirname, 'project-dist', 'bundle.css'));

//__EOF__
