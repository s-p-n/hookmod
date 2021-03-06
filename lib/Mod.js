const fs = require('fs');
const path = require('path');

const MAIN_FILENAME = 'main.js'

class Mod {
  constructor (name, group) {
    const self = this;
    this.name = name;
    this.parent = group.parent;
    this.children = '';
    this.group = group;
    this.path = path.join(group.path, name);
    this.dir = fs.readdirSync(this.path);
    /* Load Mods */
    this.ext = (function () {
      let modPath = path.join(__dirname, 'ext');
      return fs.readdirSync(modPath).
        map(filename => new (require(
          path.join(modPath, filename)))(self));
    }());

    // Remove MAIN_FILENAME from directory
    this.dir.splice(this.dir.indexOf(MAIN_FILENAME), 1);

    this.prefab = '';
    console.log('Module Dir:', this.dir);

    this.dir.forEach(dirname => this.handleSubdir(dirname));
    this.group.output += this.buildMain();
  }

  handleSubdir(dirname) {
    let subPath = path.join(this.path, dirname);
    let subDir = fs.readdirSync(subPath);
    let Group = this.group.constructor;

    if (dirname === 'modules') {
      console.log('modules dir:', subPath);
      this.children+=(new Group(
        subPath,
        `${this.parent}.modules.${this.name}.prototype`)).output;
      return;
    }
    this.prefab += `${this.parent}.modules.${this.name}.prototype.${dirname}={};\n`;
    subDir.forEach(filename => {
      let filepath = path.join(subPath, filename);
      this.ext.some(e => 
        e.check(filepath) &&
        (this.prefab += e.exec(filepath))
      );
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