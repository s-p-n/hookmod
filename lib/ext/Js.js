const path = require('path');
const fs = require('fs');
class Js {
  constructor(Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.js';
  }

  exec (filepath, code) {
    let contents = code.
        replace(/\r\n/g, '\n').
        replace(/\n/g, '\\n').
        replace(/\"/g, "\\\"");
    let prop = filepath.
      replace(this.Mod.path, '').
      replace(/\.js/, '').
      replace(/\/|\\/g, '.');

    let identifier = `${this.Mod.parent}.modules.${this.Mod.name}.prototype${prop}`;

    let generated = `${identifier} = function() {${code}};
      //${identifier}.filepath = "${filepath.replace(/\\/g, "/")}";
      //${identifier}.source = "${contents}";
      ${identifier}.prototype = ${this.Mod.parent}.modules.${this.Mod.name}.prototype;
    \n`;

    return {identifier, generated};
  }
}

module.exports = Js;