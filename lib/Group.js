const path = require('path');
const fs = require('fs');
const Mod = require('./Mod.js');

class Group {
  constructor (modulesDirectory, parent = 'window') {
    this.path = path.resolve(modulesDirectory);
    this.parent = parent;
    this.output = `${parent}.modules = {
      share: __SHARE__,
      __CACHE__: {},
      fetch: function (name) {
        if (!(name in this.__CACHE__)) {
          let m = new this[name];
          this.__CACHE__[name] = m;
          return m;
        } else {
          if ('onFetch' in this.__CACHE__[name]) {
            this.__CACHE__[name].onFetch();
          }
          return this.__CACHE__[name];
        }
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