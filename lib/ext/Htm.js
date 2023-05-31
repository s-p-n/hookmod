const fs = require('fs');
const path = require('path');

class Htm {
  constructor (Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.htm';
  }

  exec (filepath, dir, contents) {
    contents = contents.
      replace(/\r\n/g, '\n').
      replace(/\n/g, '\\n');//.
      //replace(/\"/g, "\\\"");
      
    let prop = dir + '.' + filepath.
      replace(/.*\//, '').
      replace(/\.htm/, '');

    let identifier = `${this.Mod.parent}.modules.${this.Mod.name}.prototype.${prop}`;

    let generated = `${identifier} = function() {
      return $(\`${contents.replace(/\`/g, "\\`")}\`);
    };\n`;
    //${identifier}.filepath = "${filepath.replace(/\\/g, "/")}";
    //${identifier}.source = "${contents}";
    return {identifier, generated};
  }
}

module.exports = Htm;