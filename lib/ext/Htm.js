const fs = require('fs');
const path = require('path');
const { SourceNode } = require('source-map');

class Htm {
  constructor(Mod) {
    this.Mod = Mod;
  }

  check(filepath) {
    return path.extname(filepath) === '.htm';
  }

  exec(filepath) {
    let prop = filepath
      .replace(this.Mod.path, '')
      .replace(/\.htm/, '')
      .replace(/\/|\\/g, '.');

    let html = fs.readFileSync(filepath, 'utf8');
    html = html.replace(/\\`/g, '\\\\`');

    const relativeFile = path.relative(this.Mod.group.path, filepath);
    const lines = html.split('\n');
    const templateNode = new SourceNode(null, null, relativeFile);
    lines.forEach((line, idx) => {
      templateNode.add(new SourceNode(idx + 1, 0, relativeFile, line + '\n'));
    });

    const functionNode = new SourceNode(null, null, null, `
      ${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop} = function() {
      return $( \``);
    functionNode.add(templateNode);
    functionNode.add(`\` );
    };
    ${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}.prototype = ${this.Mod.parent}.modules.${this.Mod.name}.prototype;
    `);

    return functionNode;
  }
}

module.exports = Htm;