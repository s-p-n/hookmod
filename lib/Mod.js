const fs = require('fs');
const path = require('path');

const MAIN_FILENAME = 'main.js'
let debug;
class Mod {
  constructor (name, group, debugFunc) {
    const self = this;
    debug = debugFunc;
    this.name = name;
    this.parent = group.parent;
    this.children = '';
    this.group = group;
    this.path = path.join(group.path, name);
    this.dir = fs.readdirSync(this.path);
    this.sourceCode = {};
    /* Load Mods */
    this.ext = (function () {
      let modPath = path.join(__dirname, 'ext');
      return fs.readdirSync(modPath).
        map(filename => new (require(
          path.join(modPath, filename)))(self));
    }());

    debug('Handling Module:', this.name);

    // Remove MAIN_FILENAME from directory
    this.dir.splice(this.dir.indexOf(MAIN_FILENAME), 1);

    this.prefab = '';
    debug(`${this.name} Child Directories:\n\t[${this.dir.join(', ')}]`);

    this.dir.forEach(dirname => this.handleSubdir(dirname));
    this.group.output += this.buildMain();
  }

  handleSubdir(dirname) {
    let subPath = path.join(this.path, dirname);
    let subDir = fs.readdirSync(subPath);
    let Group = this.group.constructor;

    if (dirname === 'modules') {
      debug('modules dir:', subPath);
      this.children+=(new Group(
        subPath,
        `${this.parent}.modules.${this.name}.prototype`)).output;
      return;
    }
    
    this.prefab += `${this.parent}.modules.${this.name}.prototype.${dirname}={};\n`;
    
    subDir.forEach(filename => {
      let filepath = path.join(subPath, filename);
      let contents = fs.readFileSync(filepath, 'utf8');

      this.ext.some(e => {
        if (e.check(filepath)) {
          let result = e.exec(filepath, contents);
          this.prefab += result.generated;
          this.group.sourceMapping.addMapping({
            filepath,
            contents,
            identifier: result.identifier,
            generated: result.generated
          });
        }
      });
    });
  }

  buildMain() {
    let mainContents = fs.readFileSync(
      path.join(this.path, MAIN_FILENAME), 
      'utf8'
    ).replace(/\n/g, '\n\t');
    return `${this.parent}.modules.${this.name} = (function () {
        class ${this.name} {
          ${mainContents}
        }
        return ${this.name};
      }());
      ${this.children}
      ${this.parent}.modules.${this.name}.prototype.parent = ${this.parent};
      ${this.parent}.modules.${this.name}.prototype.state = {};
      ${this.parent}.modules.${this.name}.prototype.share = __SHARE__;
      ${this.prefab}
    `;
  }
}

module.exports = Mod;