#!/usr/bin/env node

let Group = require('./lib/Group.js');
const path = require('path');
const fs = require('fs');

if (!process.argv[2]) {
  console.error("No Directory")
  process.exit(1);
}

if (!process.argv[3]) {
  console.error("No Outfile Destination")
  process.exit(1);
}

let p = new Group(process.argv[2])

p.writeTo(path.resolve(process.argv[3]));

console.log('Modules compressed.');