const path = require('path');
const fs = require('fs');
const Mod = require('./Mod.js');

let debugMode = false;

function debug() {
  if (debugMode) {
    console.log.apply(this, arguments);
  }
}

class Group {
  constructor (data, parent = false) {

    let {modulesDirectory, webDirectory} = data;

    if (parent === true) {
      debugMode = true;
      parent = false;
    }
    if (!parent) {
      parent = 'window';
    }

    debug(`Handling Module Directory: ${modulesDirectory}`);

    this.path = path.resolve(modulesDirectory);
    this.parent = parent;
    this.output = `
if (!window.jQuery) {
  console.log('Hookmod: jquery not present, building $ function.');
  function $(contents) {
    let container = document.createElement('div');
    container.innerHTML = contents;
    if (container.childElementCount === 1) {
      return container.children[0];
    } else {
      return container.children;
    }
  }
}
${parent}.modules = {
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
};
\n`;
    this.handleModuleGroup();
  }

  handleModuleGroup () {
    let dir = fs.readdirSync(this.path);

    dir.forEach(
      name => new Mod(name, this, debug)
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
