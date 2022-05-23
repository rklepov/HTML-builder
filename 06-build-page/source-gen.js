// 06-build-page/source-gen.js

const { EOL } = require('os');
const path = require('path');
const fs = require('fs/promises');
const readline = require('readline');
const { createReadStream, createWriteStream, fstat } = require('fs');

class SourceGen {
  constructor(templatePath) {
    this.templatePath = templatePath;
    this.components = new Map();
    this.reTag = /{{(\w+)}}/g;
  }

  async loadComponents(componentsDir) {
    const components = await fs.readdir(componentsDir, {
      withFileTypes: true,
    });

    for (const component of components) {
      if (!component.isFile() || !component.name.match(/\.html$/)) continue;
      const componentFile = path.join(componentsDir, component.name);
      const content = await this.getFileContent(componentFile);
      console.log(path.basename(componentFile));
      this.components.set(path.basename(componentFile, '.html'), content);
    }
  }

  generate(dstPath) {
    return new Promise((resolve, reject) => {
      try {
        const input = createReadStream(this.templatePath);
        const output = createWriteStream(dstPath);

        const rl = readline.createInterface({
          input,
          crlfDelay: Infinity,
        });

        rl.on('line', (line) => {
          line = line.replace(this.reTag, (match, component) => {
            if (!component || !this.components.has(component)) return match;
            return this.components.get(component);
          });
          output.write(`${line}${EOL}`);
        }).on('close', () => {
          output.end(() => {
            console.log(`DONE: ${path.basename(dstPath)}`);
            resolve(dstPath);
          });
        });
      } catch (e) {
        console.error('SourceGen::generate', e);
        reject(e);
      }
    });
  }

  getFileContent(filePath) {
    return (function (stream) {
      let data = '';
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => (data += chunk));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(data));
      });
    })(createReadStream(filePath, { encoding: 'utf8' }));
  }
}

module.exports = SourceGen;

//__EOF__
