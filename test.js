const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tempDir = path.join(__dirname, 'temp_test');
const modulesDir = path.join(tempDir, 'modules');
const outputFile = path.join(tempDir, 'hookmod.js');

// Setup sample modules
fs.mkdirSync(modulesDir, { recursive: true });
fs.mkdirSync(path.join(modulesDir, 'foo'));

// .js (main.js - required)
fs.writeFileSync(path.join(modulesDir, 'foo', 'main.js'), `
constructor() { this.state.test = 'ok'; }
onFetch() { console.log('fetched'); }
`);

// .htm (dynamic template)
fs.mkdirSync(path.join(modulesDir, 'foo', 'ui'));
fs.writeFileSync(path.join(modulesDir, 'foo', 'ui', 'template.htm'), `
<div>Hello, \${this.name}</div>
`);  // Preserved newlines; literal ${this.name}

// .css (dynamic styles, with interpolation and preserved whitespace)
fs.writeFileSync(path.join(modulesDir, 'foo', 'ui', 'styles.css'), `
body {
  color: \${this.color};
}
`);  // Preserved formatting

// .js (additional utility)
fs.mkdirSync(path.join(modulesDir, 'foo', 'lib'));
fs.writeFileSync(path.join(modulesDir, 'foo', 'lib', 'util.js'), `
return this.state.test + ' extra';
`);

// .json (static data)
fs.mkdirSync(path.join(modulesDir, 'foo', 'data'));
fs.writeFileSync(path.join(modulesDir, 'foo', 'data', 'config.json'), `{"key": "value"}`);

// Run CLI
try {
  execSync(`node ${path.join(__dirname, 'exec.js')} ${modulesDir} ${outputFile}`);
  console.log('Bundling succeeded.');

  // Verify output
  const output = fs.readFileSync(outputFile, 'utf8');
  const normalizedOutput = output.replace(/\s+/g, ' ');

  // .js main: Class definition (normalized)
  if (!normalizedOutput.includes("window.modules.foo = (function () { class foo { constructor() { this.state.test = 'ok'; } onFetch() { console.log('fetched'); } } return foo; }())")) {
    throw new Error('Missing main.js module definition');
  }

  // .htm: Function with $(`...`) (normalized)
  if (!normalizedOutput.includes("ui.template=function() { return $(` <div>Hello, ${this.name}</div> `); }")) {
    throw new Error('Missing or incorrect .htm template');
  }

  // .css: Function returning template string (normalized)
  if (!normalizedOutput.includes("ui.styles=function() { return ` body { color: ${this.color}; } `; }")) {
    throw new Error('Missing or incorrect .css function');
  }

  // .js (additional): Prototype method (normalized)
  if (!normalizedOutput.includes("lib.util=function() { return this.state.test + ' extra'; }")) {
    throw new Error('Missing additional .js method');
  }

  // .json: Direct object attachment
  if (!normalizedOutput.includes('data.config = {"key": "value"}')) {  // JSON is more consistent without extra spaces
    throw new Error('Missing .json data attachment');
  }

  // Core runtime
  if (!normalizedOutput.includes('__CACHE__') || !normalizedOutput.includes('__SHARE__')) {
    throw new Error('Missing core runtime');
  }

  console.log('Output verified: All extensions and runtime present.');
} catch (e) {
  console.error('Test failed:', e.message);
  process.exit(1);
} finally {
  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });
}

console.log('All tests passed.');