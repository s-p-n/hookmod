const path = require('path');
const fs = require('fs');
class Js {
  constructor(Mod) {
    this.Mod = Mod;
  }

  check (filepath) {
    return path.extname(filepath) === '.js';
  }

  exec (filepath, dir, code) {
    let contents = code.
        replace(/\r\n/g, '\n').
        replace(/\n/g, '\\n').
        replace(/\"/g, "\\\"");
    let prop = dir + '.' + filepath.
      replace(/.*\//, '').
      replace(/\.js/, '');

    let identifier = `${this.Mod.parent}.modules.${this.Mod.name}.prototype.${prop}`;
    console.log('filepath:', filepath)
    console.log('dirname:', dir);
    console.log('Mod path:', this.Mod.path)
    console.log('parent:', this.Mod.parent)
    console.log('name:', this.Mod.name)
    console.log('id:', identifier)
    let generated = `${identifier} = function() {${code}};
      //${identifier}.filepath = "${filepath.replace(/\\/g, "/")}";
      //${identifier}.source = "${contents}";
      ${identifier}.prototype = ${this.Mod.parent}.modules.${this.Mod.name}.prototype;
    \n`;

    return {identifier, generated};
  }
}

module.exports = Js;