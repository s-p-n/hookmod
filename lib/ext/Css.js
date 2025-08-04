const fs = require('fs');
const path = require('path');
const { SourceNode } = require('source-map');

class Css {
  constructor (Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.css';
  }

  exec (filepath) {
    let prop = filepath.
      replace(this.Mod.path, '').
      replace(/\.css/, '').
      replace(/\/|\\/g, '.');

    let css = fs.readFileSync(filepath, 'utf8');
    css = css.replace(/`/g, '\\`');  // Escape backticks for template literals

    const relativeFile = path.relative(this.Mod.group.path, filepath);
    const lines = css.split('\n');
    const templateNode = new SourceNode(null, null, relativeFile);
    lines.forEach((line, idx) => {
      templateNode.add(new SourceNode(idx + 1, 0, relativeFile, line + '\n'));
    });

    const functionNode = new SourceNode(null, null, null, `
      ${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}=function() {
        return \``);
    functionNode.add(templateNode);
    functionNode.add(`\`;
      };
      ${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}.prototype = ${this.Mod.parent}.modules.${this.Mod.name}.prototype;\n`);
    return functionNode;
  }
}

module.exports = Css;