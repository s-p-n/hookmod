const fs = require('fs');
const path = require('path');

class Json {
  constructor (Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.json';
  }

  exec (filepath, contents) {
    //contents = contents.
    //  replace(/\r\n/g, '\n').
    //  replace(/\n/g, '\\n').
    //  replace(/\"/g, "\\\"");
    let prop = filepath.
      replace(this.Mod.path, '').
      replace(/\.json/, '').
      replace(/\/|\\/g, '.');

    let identifier = `${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}`;

    let generated = `${identifier} = ${contents};\n`;

    return {identifier, generated};
  }
}

module.exports = Json;
