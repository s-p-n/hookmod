const fs = require('fs');
const path = require('path');

class Htm {
  constructor (Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.htm';
  }

  exec (filepath) {
    let prop = filepath.
      replace(this.Mod.path, '').
      replace(/\.htm/, '').
      replace(/\/|\\/g, '.');

    let funcBody = `return $(\`${
      fs.readFileSync(filepath, 'utf8').
      replace(/\s+/g, ' ').
      replace(/\`/g, "\\`")
    }\`);\n`;

    return `${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}=function() {
      ${funcBody}
    };
    ${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}.prototype = ${this.Mod.parent}.modules.${this.Mod.name}.prototype;\n`;
  }
}

module.exports = Htm;