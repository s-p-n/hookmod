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
    let generated_lines = properties.generated.split('\n');
    let original_lines = properties.contents.split('\n');

    let first_line_with_content = original_lines.findIndex(line => {
      return line.replace(/\s+/g, '').length > 0;
    });

    console.log(first_line_with_content)

    if (first_line_with_content == -1) {
      this.offset += 1;
      this.smg.addMapping({
          generated: { line: this.offset, column: 0 },
          original: { line: 1, column: 0 },
          source: properties.filepath,
          name: properties.identifier
      });
    } else {



      console.log('first line with content: ', original_lines[first_line_with_content]);
      
      let matching_generated_index = generated_lines.findIndex(line => {
        line = line.replace(/\s+/g, '');
        console.log(line)
        let result = line.includes(original_lines[first_line_with_content].replace(/\s+/g, ''));
        console.log("found? ", result);
        return result;
      });

      let total_offset = generated_lines.length - original_lines.length;
      let start_offset = matching_generated_index - first_line_with_content;
      let end_offset = total_offset - start_offset;

      console.log('original line start:', first_line_with_content);
      console.log('generated beginning offset:', matching_generated_index);
      console.log('original length:', original_lines.length);
      console.log('generated length:', generated_lines.length);
      console.log('total offset:', total_offset);
      console.log('start offset:', start_offset);
      console.log('end offset:', end_offset);

      if (total_offset >= 0) {

        this.offset += start_offset;

        for (let i = 0; i < generated_lines.length; i += 1) {
          this.smg.addMapping({
              generated: { line: this.offset, column: 0 },
              original: { line: i + 1, column: 0 },
              source: properties.filepath,
              name: properties.identifier
          });
          this.offset += 1;
        }

        this.offset += end_offset;
      } else {
        for (let i = 0; i < original_lines.length; i += 1) {
          let line = original_lines[i];
          this.smg.addMapping({
              generated: { line: this.offset, column: generated_lines[0].indexOf(line) },
              original: { line: i + 1, column: 0 },
              source: properties.filepath,
              name: properties.identifier
          });
          //this.offset += 1;
        }

      }
    }
    /*
    this.smg.addMapping({
        generated: { line: this.offset, column: 0 },
        original: { line: loc.line, column: loc.column },
        source: filepath,
        name: prop
    });
    this.offset += contents.split('\n').length;
    */
  }

  writeSourceMap(filename) {
    if (this.disabled) {
      return;
    }
    var map = this.smg.toJSON();
    map.file = filename;
    var mapfile = filename + '.map';
    fs.writeFileSync(mapfile, JSON.stringify(map));
    console.lo("Source map written to:", mapfile);
  }
}

module.exports = SourceMapping
