const fs = require('fs');
const path = require('path');
const { SourceNode } = require('source-map');

class Js {
  constructor(Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.js';
  }

  exec (filepath) {
    let prop = filepath.
      replace(this.Mod.path, '').
      replace(/\.js/, '').
      replace(/\/|\\/g, '.');

    let jsContent = fs.readFileSync(filepath, 'utf8');

    const relativeFile = path.relative(this.Mod.group.path, filepath);
    const lines = jsContent.split('\n');
    const contentNode = new SourceNode(null, null, relativeFile);
    lines.forEach((line, idx) => {
      contentNode.add(new SourceNode(idx + 1, 0, relativeFile, line + '\n'));
    });

    const functionNode = new SourceNode(null, null, null, `
      ${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}=function() {
        `);
    functionNode.add(contentNode);
    functionNode.add(`
      };
      ${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}.prototype = ${this.Mod.parent}.modules.${this.Mod.name}.prototype;\n`);
    return functionNode;
  }
}

module.exports = Js;