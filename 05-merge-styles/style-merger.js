// 05-merge-styles/style-merger.js

const path = require('path');
const fs = require('fs/promises');
const { createWriteStream, createReadStream } = require('fs');

class StyleMerger {
  constructor(srcDir) {
    this.srcDir = srcDir;
  }

  async merge(bundle) {
    try {
      const srcEntries = await fs.readdir(this.srcDir, { withFileTypes: true });

      const output = createWriteStream(bundle).on('finish', () => {
        console.log(`DONE: ${path.basename(bundle)}`);
      });

      const handler = srcEntries.reduceRight(
        (handler, srcEntry) => {
          if (!srcEntry.isFile()) return handler;
          if (!srcEntry.name.match(/\.css$/)) return handler;

          return (writeStream) => {
            return new Promise((resolve, reject) => {
              const input = createReadStream(
                path.join(this.srcDir, srcEntry.name),
              )
                .on('end', () => {
                  console.log(srcEntry.name);
                  resolve(handler(writeStream));
                })
                .on('error', (e) => reject(e));

              input.pipe(output, { end: false });
            });
          };
        },
        (writeStream) => {
          return new Promise((resolve) => {
            writeStream.end(() => {
              resolve();
            });
          });
        },
      );

      return handler(output);
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = StyleMerger;

//__EOF__
