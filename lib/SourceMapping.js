const fs = require('fs');
const sourceMap = require('source-map');

class SourceMapping {
  constructor(modulesDirectory, group) {
    this.smg = new sourceMap.SourceMapGenerator({
      file: "modules.js",
      sourceRoot: modulesDirectory
    });
    this.offset = 1;
    this.group = group;
    this.disabled = false;
  }

  addMapping(properties) {
    if (this.disabled) {
      return;
    }
    let lines = properties.generated.split('\n');

    for (let i = 0; i < lines.length; i += 1) {
      this.smg.addMapping({
          generated: { line: this.offset, column: 0 },
          original: { line: loc.line, column: loc.column },
          source: filepath,
          name: prop
      });
      this.offset += 1
    }

    this.smg.addMapping({
        generated: { line: this.offset, column: 0 },
        original: { line: loc.line, column: loc.column },
        source: filepath,
        name: prop
    });
    this.offset += contents.split('\n').length;
  }

  writeSourceMap(filename) {
    if (this.disabled) {
      return;
    }
    var map = this.smg.toJSON();
    map.file = filename;
    var mapfile = filename + '.map';
    fs.writeFileSync(mapfile, JSON.stringify(map));
  }
}

module.exports = SourceMapping
