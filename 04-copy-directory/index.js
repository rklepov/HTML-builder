// 04-copy-directory/index.js

const path = require('path');
const fs = require('fs/promises');
const { pipeline } = require('stream/promises');
const { createReadStream, createWriteStream } = require('fs');

class DirSync {
  constructor(srcDir) {
    this.srcDir = srcDir;
  }

  async copyFile(srcFilePath, dstFilePath) {
    console.log(`COPY: Copying '${srcFilePath}' to '${dstFilePath}'`);
    await pipeline(
      createReadStream(srcFilePath),
      createWriteStream(dstFilePath),
    );
  }

  async diff(srcFilePath, dstFilePath) {
    try {
      const srcFileStat = await fs.stat(srcFilePath);
      const dstFileStat = await fs.stat(dstFilePath);
      return (
        srcFileStat.size != dstFileStat.size ||
        srcFileStat.mtime > dstFileStat.mtime
      );
    } catch (e) {
      console.error('DirSync::diff', e.toString());
      return false;
    }
  }

  async exists(path) {
    try {
      await fs.access(path);
      return true;
    } catch (e) {
      return false;
    }
  }

  async syncDir(dstDir) {
    try {
      console.log(`SYNC: Syncing directory '${this.srcDir}' to '${dstDir}'`);

      const srcEntries = await fs.readdir(this.srcDir, { withFileTypes: true });

      if (!(await this.exists(dstDir))) {
        console.log(`MKD : Creating directory '${dstDir}'`);
        await fs.mkdir(dstDir);
      }
      const dstEntries = await fs.readdir(dstDir, { withFileTypes: true });

      // copy new and modified entries from the source directory
      for (let srcEntry of srcEntries) {
        const entryName = srcEntry.name;

        const dstEntry = dstEntries.find(
          (dstEntry) => dstEntry.name === entryName,
        );

        const srcPath = path.relative('.', path.join(this.srcDir, entryName));
        const dstPath = path.relative('.', path.join(dstDir, entryName));

        if (srcEntry.isDirectory() && (!dstEntry || dstEntry.isDirectory())) {
          // syncing subdirectories recursively
          const subDirSync = new DirSync(srcPath);
          await subDirSync.syncDir(dstPath);
          continue;
        }

        if (!dstEntry) {
          // source is a file and dest doesn't exist
          await this.copyFile(srcPath, dstPath);
          continue;
        }

        if (srcEntry.isDirectory() && !dstEntry.isDirectory()) {
          console.warn(
            `WARN: Source '${srcPath}' is a directory while dest '${dstPath}' is a file, not going to sync`,
          );
          continue;
        }

        if (!srcEntry.isDirectory() && dstEntry.isDirectory()) {
          console.warn(
            `WARN: Source '${srcPath}' is a file while dest '${dstPath}' is a directory, not going to sync`,
          );
          continue;
        }

        if (await this.diff(srcPath, dstPath)) {
          // both entries are files and they are different
          await this.copyFile(srcPath, dstPath);
          continue;
        }

        console.log(
          `KEEP: '${srcPath}' and '${dstPath}' are identical, no action required`,
        );
      }

      // remove deleted entries from the destination directory
      for (let dstEntry of dstEntries) {
        const srcEntry = srcEntries.find(
          (srcEntry) => srcEntry.name === dstEntry.name,
        );

        const dstPath = path.relative('.', path.join(dstDir, dstEntry.name));

        if (!srcEntry && dstEntry.isFile()) {
          console.log(`DEL : Deleting file '${dstPath}'`);
          await fs.rm(dstPath);
        }
      }

      console.log(`DONE: ${this.srcDir}`);
    } catch (e) {
      console.error('DirSync::syncDir', e.toString());
    }
  }
}

const dirSync = new DirSync(path.join(__dirname, 'files'));
dirSync.syncDir(path.join(__dirname, 'files-copy'));

//__EOF__
