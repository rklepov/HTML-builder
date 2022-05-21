// 02-write-file/index.js

const { EOL } = require('os');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

class Writer {
  constructor(filename) {
    this.filepath = path.join(__dirname, filename);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.rl.setPrompt('Type the text and press ENTER > ');
    this.rl.on('line', this.onLine.bind(this));
    this.rl.on('SIGINT', this.onSIGINT.bind(this));
  }

  start() {
    try {
      this.output = fs.createWriteStream(this.filepath);
      process.stdout.write(`Writing to '${this.filepath}' ...${EOL}`);
      process.stdout.write(`Type 'exit' or press Ctrl+C to finish${EOL}${EOL}`);
      this.rl.prompt();
    } catch (e) {
      console.error(e.toString());
    }
  }

  stop() {
    process.stdout.write(`${EOL}Bye!`);
    this.output.close();
    this.rl.close();
  }

  onLine(text) {
    process.stdout.write(`${text}${EOL}`);
    if (text.match(/^exit$/)) {
      this.stop();
    } else {
      this.output.write(`${text}${EOL}`);
      this.rl.prompt();
    }
  }

  onSIGINT() {
    this.stop();
  }
}

const writer = new Writer('text.txt');
writer.start();

//__EOF__
