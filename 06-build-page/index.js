// 06-build-page/index.js

const path = require('path');

const DirSync = require('../04-copy-directory/dir-sync');
const StyleMerger = require('../05-merge-styles/style-merger');
const SourceGen = require('./source-gen');

async function buildPage(
  htmlTemplatePath,
  componentsDir,
  assetsDir,
  stylesDir,
  distDir,
) {
  try {
    const dirSync = new DirSync(assetsDir);
    await dirSync.syncDir(path.join(distDir, path.basename(assetsDir)));

    const htmlGen = new SourceGen(htmlTemplatePath);
    await htmlGen.loadComponents(componentsDir);
    await htmlGen.generate(path.join(distDir, 'index.html'));

    const styleMerger = new StyleMerger(stylesDir);
    await styleMerger.merge(path.join(distDir, 'style.css'));
  } catch (e) {
    console.error('buildPage():', e.toString());
  }
}

buildPage(
  path.join(__dirname, 'template.html'),
  path.join(__dirname, 'components'),
  path.join(__dirname, 'assets'),
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist'),
);

//__EOF__
