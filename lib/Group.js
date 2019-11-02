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
        if (!__CACHE__.has(${parent})) {
          __CACHE__.set(${parent}, {});
        }
        let cache =  __CACHE__.get(${parent});
        if (!(name in cache)) {
          cache[name] = new this[name];
        }
        if ('onFetch' in cache[name]) {
          cache[name].onFetch();
        }
        return cache[name];
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
    let contents = `
    (function () {
      const __SHARE__ = {};
      const __CACHE__ = new WeakMap();
      ${this.output}
    }());`;
    return fs.writeFileSync(
      filename, 
      contents, 
      'utf8');
  }
}

module.exports = Group