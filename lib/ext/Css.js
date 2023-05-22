const fs = require('fs');
const path = require('path');

class Css {
  constructor (Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.css';
  }

  exec (filepath, contents) {
    contents = contents.
        replace(/\s+/g, ' ').
        replace(/\`/g, "\\`");
    let prop = filepath.
      replace(this.Mod.path, '').
      replace(/\.css/, '').
      replace(/\/|\\/g, '.');

    let identifier = `${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}`;

    let generated = `${identifier} = \`${contents}\`;
      ${identifier}.filepath = "${filepath.replace(/\\/g, "/")}";
    `;
    return {identifier, generated}
  }
}

module.exports = Css;
