#!/usr/bin/env node

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
  console.error(`${message}\n${instructions}`);
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

let options = {
  modulesDirectory: process.argv[2],
  verbose
};
let p = new Group(options);

p.writeTo(path.resolve(process.argv[3]));

console.log('Modules compressed.');