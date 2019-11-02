const fs = require('fs');
const path = require('path');

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
      replace(/\//g, '.');

    return `${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}="${
        fs.readFileSync(filepath, 'utf8').
        replace(/\s+/g, ' ').
        replace(/\"/g, "\\\"")
      }";\n`;
  }
}

module.exports = Css;