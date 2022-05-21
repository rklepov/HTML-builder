// 03-files-in-folder/index.js

const { EOL } = require('os');
const fs = require('fs/promises');
const path = require('path');

async function list(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  entries.forEach(async (entry) => {
    if (entry.isFile()) {
      const filename = entry.name;
      const ext = path.extname(filename);

      const stat = await fs.stat(path.join(dir, entry.name));

      process.stdout.write(
        `${path.basename(filename, ext)} - ${path
          .extname(filename)
          .split('.')
          .pop()} - ${(stat.size / 1024).toFixed(3)}kb${EOL}`,
      );
    }
  });
}

list(path.join(__dirname, 'secret-folder'));

//__EOF__
