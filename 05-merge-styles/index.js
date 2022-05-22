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

      const handler = srcEntries.reduceRight(
        (handler, srcEntry) => {
          if (!srcEntry.isFile()) return handler;
          if (!srcEntry.name.match(/\.css$/)) return handler;

          return (writeStream) => {
            const input = createReadStream(path.join(srcDir, srcEntry.name)).on(
              'end',
              () => {
                console.log(srcEntry.name);
                handler(writeStream);
              },
            );

            input.pipe(output, { end: false });
          };
        },
        (writeStream) => {
          writeStream.end();
        },
      );

      handler(output);
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
