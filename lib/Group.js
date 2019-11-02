const path = require('path');
const fs = require('fs');
const Mod = require('./Mod.js');

class Group {
  constructor (modulesDirectory, parent = 'window') {
    this.path = path.resolve(modulesDirectory);
    this.parent = parent;
    this.output = `${parent}.modules = {
      share: __SHARE__,
      fetch: function (name) {
        let m = new this[name];
        this[name].prototype.loaded = true;
        return m;
      }
    };\n`;
    this.handleModuleGroup();
  }

  handleModuleGroup () {
    let dir = fs.readdirSync(this.path);

    dir.forEach(
      name => new Mod(name, this)
    );
  }

  writeTo (filename) {
    return fs.writeFileSync(
      filename, 
      'const __SHARE__ = {};\n' + this.output, 
      'utf8')
  }
}

module.exports = Group