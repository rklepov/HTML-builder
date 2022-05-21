// 05-merge-styles/index.js

const path = require('path');
const fs = require('fs/promises');
const { createWriteStream, createReadStream } = require('fs');

class StyleMerger {
  constructor(bundle) {
    this.bundle = bundle;
  }

  async merge(srcDir) {
    try {
      const srcEntries = await fs.readdir(srcDir, { withFileTypes: true });

      const output = createWriteStream(this.bundle).on('finish', () => {
        console.log(`DONE: ${path.basename(this.bundle)}`);
      });

      for (let srcEntry of srcEntries) {
        if (!srcEntry.isFile()) continue;

        if ('css' === srcEntry.name.split('.').pop()) {
          console.log(srcEntry.name);
          const input = createReadStream(path.join(srcDir, srcEntry.name));

          input.pipe(output);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

const styleMerger = new StyleMerger(
  path.join(__dirname, 'project-dist', 'bundle.css'),
);
styleMerger.merge(path.join(__dirname, 'styles'));

//__EOF__
