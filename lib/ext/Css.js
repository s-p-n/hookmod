const fs = require('fs');
const path = require('path');

class Css {
  constructor (Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.css';
  }

  exec (filepath, dir, contents) {
    contents = contents.
        replace(/\s+/g, ' ').
        replace(/\`/g, "\\`");
    let prop = dir + '.' + filepath.
      replace(/.*\//, '').
      replace(/\.css/, '');

    let identifier = `${this.Mod.parent}.modules.${this.Mod.name}.prototype.${prop}`;

    let generated = `${identifier} = \`${contents}\`;
      ${identifier}.filepath = "${filepath.replace(/\\/g, "/")}";
    `;
    return {identifier, generated}
  }
}

module.exports = Css;
