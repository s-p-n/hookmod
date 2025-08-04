const fs = require('fs');
const path = require('path');
const { SourceNode, SourceMapConsumer, SourceMapGenerator } = require('source-map');

const Mod = require('./Mod.js');

let debugMode = true;

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
    this.node = new SourceNode(null, null, null, `(function () {
  const __SHARE__ = {};
  const __CACHE__ = new WeakMap();
`);
    this.node.add(new SourceNode(null, null, null, `
if (window.jQuery) {
  $ = window.jQuery;
} else {
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
`));
    this.handleModuleGroup();
    this.node.add(`}());`);
  }

  appendToOutput(code, originalFile = null, originalContent = null) {
    if (originalFile && originalContent) {
      const relativeFile = path.relative(this.path, originalFile);
      const lines = code.trim().split('\n');
      const chunks = [];
      lines.forEach((line, idx) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          const col = line.indexOf(trimmedLine);
          chunks.push(new SourceNode(idx + 1, col, relativeFile, trimmedLine + '\n'));
        } else {
          chunks.push('\n');
        }
      });
      this.node.add(chunks);
    } else {
      this.node.add(code);
    }
  }

  handleModuleGroup () {
    let dir = fs.readdirSync(this.path);

    dir.forEach(
      name => new Mod(name, this, debug)
    );
  }

  writeTo (filename) {
    const { code, map } = this.node.toStringWithSourceMap({ file: path.basename(filename) });
    let contents = code;
    contents += `\n//# sourceMappingURL=${path.basename(filename)}.map`;
    let mapString = map.toString();
    let mapJson = JSON.parse(mapString);
    mapJson.sourceRoot = '';
    if (!Array.isArray(mapJson.sourcesContent)) {
      mapJson.sourcesContent = [];
    }
    mapJson.sources.forEach((source, idx) => {
      if (source && !mapJson.sourcesContent[idx]) {
        const fullPath = path.join(this.path, source);
        if (fs.existsSync(fullPath)) {
          let content = fs.readFileSync(fullPath, 'utf8');
          content = content.replace(/\t/g, '  ').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();  // Normalize and trim
          mapJson.sourcesContent[idx] = content;
        }
      }
    });
    fs.writeFileSync(filename + '.map', JSON.stringify(mapJson), 'utf8');
    return fs.writeFileSync(filename, contents, 'utf8');
  }
}

module.exports = Group