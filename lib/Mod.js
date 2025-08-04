const fs = require('fs');
const path = require('path');
const { SourceNode } = require('source-map');

const MAIN_FILENAME = 'main.js'
let debug;
class Mod {
  constructor (name, group, debugFunc) {
    const self = this;
    debug = debugFunc;
    this.name = name;
    this.parent = group.parent;
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

    debug('Handling Module:', this.name);

    // Remove MAIN_FILENAME from directory
    this.dir.splice(this.dir.indexOf(MAIN_FILENAME), 1);

    this.prefab = '';
    debug(`${this.name} Child Directories:\n\t[${this.dir.join(', ')}]`);

    this.buildMain();
    this.dir.forEach(dirname => this.handleSubdir(dirname));
  }

  handleSubdir(dirname) {
    let subPath = path.join(this.path, dirname);
    let subDir = fs.readdirSync(subPath);
    let Group = this.group.constructor;

    if (dirname === 'modules') {
      debug('modules dir:', subPath);
      let subGroup = new Group({ modulesDirectory: subPath }, `${this.parent}.modules.${this.name}.prototype`);
      this.group.appendToOutput(subGroup.node.toString());
      // Merge map if needed, but since we're using SourceNode, add the sub node directly
      this.group.node.add(subGroup.node);
      return;
    }
    this.group.node.add(new SourceNode(null, null, null, `${this.parent}.modules.${this.name}.prototype.${dirname}={};\n`));
    //this.prefab += `${this.parent}.modules.${this.name}.prototype.${dirname}={};\n`;
    subDir.forEach(filename => {
      let filepath = path.join(subPath, filename);
      this.ext.some(e => {
        if (e.check(filepath)) {
          //this.prefab += e.exec(filepath);
          this.group.node.add(e.exec(filepath));
        }
      }
      );
    });
  }

  buildMain() {
    let mainFile = path.join(this.path, MAIN_FILENAME);
    let mainContents = fs.readFileSync(mainFile, 'utf8');
    this.group.appendToOutput(`${this.parent}.modules.${this.name} = (function () {
        class ${this.name} {
    `);
    this.group.appendToOutput(mainContents, mainFile, mainContents);
    this.group.appendToOutput(`
        }
        return ${this.name};
      }());\n`);
    this.group.appendToOutput(this.prefab);
    this.group.appendToOutput(`
      ${this.parent}.modules.${this.name}.prototype.parent = ${this.parent};
      ${this.parent}.modules.${this.name}.prototype.state = {};
      ${this.parent}.modules.${this.name}.prototype.share = __SHARE__;
      `);
  }
}

module.exports = Mod;