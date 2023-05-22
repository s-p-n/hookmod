const fs = require('fs');
const path = require('path');

class Htm {
  constructor (Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.htm';
  }

  exec (filepath, contents) {
    contents = contents.
      replace(/\r\n/g, '\n').
      replace(/\n/g, '\\n').
      replace(/\"/g, "\\\"");
    let prop = filepath.
      replace(this.Mod.path, '').
      replace(/\.htm/, '').
      replace(/\/|\\/g, '.');

    let identifier = `${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}`;

    let generated = `${identifier} = $(\`${contents.replace(/\`/g, "\\`")}\`);
    ${identifier}.call = (function (thisObj={}) {
      if (typeof thisObj === "object") {
        for (let prop in thisObj) {
          this[prop] = thisObj[prop];
        }
      }
      return $(\`${contents.replace(/\`/g, "\\`")}\`);
    });\n`;
    //${identifier}.filepath = "${filepath.replace(/\\/g, "/")}";
    //${identifier}.source = "${contents}";
    return {identifier, generated};
  }
}

module.exports = Htm;