// 05-merge-styles/style-merger.js

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

module.exports = StyleMerger;

//__EOF__
