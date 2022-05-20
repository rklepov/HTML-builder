// 01-read-file/index.js

const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

async function readFile(filename) {
  await pipeline(fs.createReadStream(filename), process.stdout);
}

function read(filename) {
  try {
    readFile(filename);
  } catch (e) {
    console.error(e.toString());
  }
}

read(path.join(__dirname, 'text.txt'));

//__EOF__
