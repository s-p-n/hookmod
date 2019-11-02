const path = require('path');
const fs = require('fs');
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
      replace(/\//g, '.')
    return `${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}=function() {
      ${fs.readFileSync(filepath, 'utf8').replace(/\n/g, '\n\t')}
    };
    ${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}.prototype = ${this.Mod.parent}.modules.${this.Mod.name}.prototype;\n`;
  }
}

module.exports = Js;