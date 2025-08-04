const fs = require('fs');
const path = require('path');
const { SourceNode } = require('source-map');

class Json {
  constructor (Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.json';
  }

  exec (filepath) {
    let contents = fs.readFileSync(filepath, 'utf8');
    let prop = filepath.
      replace(this.Mod.path, '').
      replace(/\.json/, '').
      replace(/\/|\\/g, '.');

    const relativeFile = path.relative(this.Mod.group.path, filepath);
    const lines = contents.split('\n');
    const contentNode = new SourceNode(null, null, relativeFile);
    lines.forEach((line, idx) => {
      contentNode.add(new SourceNode(idx + 1, 0, relativeFile, line + '\n'));
    });

    const assignmentNode = new SourceNode(null, null, null, `${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop} = `);
    assignmentNode.add(contentNode);
    assignmentNode.add(`;\n`);
    return assignmentNode;
  }
}

module.exports = Json;