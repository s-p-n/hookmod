#!/usr/bin/env node

require('colors');

let Group = require('./lib/Group.js');
let verbose = false;
const path = require('path');
const fs = require('fs');
const instructions = (function () {
  return `
  +-------------------------------------------+
  | Usage:                                    |
  | $ hookmod <modulesDirectory> <outfile>    |
  |                                           |
  | Verbose Usage:                            |
  | $ hookmod -v <modulesDirectory> <outfile> |
  +-------------------------------------------+
`;
}());

function error (message) {
  console.error(`${message.red}${instructions.black}`.bgBrightWhite);
}

if (process.argv[2] === '-v') {
  verbose = true;
  process.argv[2] = process.argv[3];
  process.argv[3] = process.argv[4];
}

if (!process.argv[2]) {
  error("Error: No Modules Directory")
  process.exit(1);
}

if (!process.argv[3]) {
  error("Error: No Outfile Destination")
  process.exit(1);
}

let p = new Group(process.argv[2], verbose);

p.writeTo(path.resolve(process.argv[3]));

console.log('Modules compressed.');