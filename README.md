## Abstract
Modules were put in the browser to give developers a way to encapsulate code and share data more safely. Using modules allows developers to separate concerns, share data, and keep files small. Modules don't restrict you completely, and allow you to get work done. Because of the nature of JavaScript in the browser, developers still need to be smart about not polluting global. Thankfully, Modules provide a means of sharing data so that it's easy to get work done without performing bad practices that end up hindering development speed in the long run.

## How Modules Are Stored and Loaded
Modules get compiled into a single JavaScript file- the CSS, HTML, and JavaScript from all of the modules are all built and compressed together. When the browser loads, modules do not execute until they are *fetched*. 

### The Module Dev Environment and Creating a Module
* Start with a root folder. In this project, that folder is `/src/module/`. 
* From there, you may create modules by creating a folder. 
* * The name of the folder is the name of the module. There's no need to label your module anywhere else.
* * The name of the folder must be compatible with a JavaScript variable syntax.
* * * It must not start with a number.
* * * It must not have special characters, except for `_`.
* * * Lower case and upper case alphanumeric characters are fine.. Except when it breaks the first rule.
* Every module has only a single file called `main.js`. The file cannot be named anything else.

Example *(modules `foo`, and `bar`)*:
```
- /src
- - /module
- - - /foo
- - - - main.js
- - - /bar
- - - - main.js
```

That's all you need for a working module.

To make your module more useful, create sub-directories. 
* The module's interior folders must also be compatible with JavaScript variables.
* The module's interior folders must not be named "modules"
* * To create child modules, make a folder named `modules` and create modules in it.
* * Fetch those modules using `this.fetch("folderName")` from it's parent.
* Inside of the interior folders, create files.
* * The files must be either JavaScript, CSS, or partial HTML documents.
* * JavaScript files must end with `.js`.
* * CSS files must end with `.css`.
* * Partial HTML documents must end with `.htm`.
* * Apart from the extension, the filename must be compatible with JavaScript variables.

Example 2: *(`foo` module with a child `bar` module and some extra stuff)*
```
- /src
- - /module
- - - /foo
- - - - /modules
- - - - - /bar
- - - - - - /scripts
- - - - - - - BarClass.js
- - - - - - - events.js
- - - - - - /ui
- - - - - - - display.htm
- - - - - - - interactive.css
- - - - - - main.js
(foo) - /loaders
- - - - - barLoader.js
- - - - /ui
- - - - - list.css
- - - - - listModules.htm
- - - - main.js
```

***

## What Modules Do
* **Separate concerns** 
* * by storing HTML, CSS, and JavaScript files that associate with each other together.
* * by enforcing a single sub-directory is used, modules encourage the developer to keep each concern small.
* * by offering a hierarchical design and encouraging the use of multiple files, refactoring large modules into smaller ones is much easier.
* **Share data** within the module.
* * JavaScript files are stored as constructor functions that share a prototype. This allows them to share state with other scripts within the same module. Modules use `this` and provide a `state` object among other things to make sharing within a module easy.
* * * The `state` member is a special sort of object, allowing the scripts to listen for changes on `state` and bind event listeners to react to data changes. This allows the developer to separate the concern of the user experience from talking with the server, and various other situations. 
* * HTML Files are automatically parsed by jQuery, ready to select, add style to, and use in clever ways.
* * CSS Files are stored within the module as text. 
* * * Generally, you wrap `<style>` tags around your css, and append it to `<head>` in order to use it. You would do this using JavaScript.
* * * Make your CSS a templated language. We're using JavaScript here, so why not preprocess it? I don't personally do this right now, but the advantages of using identifiers to store colors is clear. It's even possible to use SCSS, SASS, or anything else in the future. We can parse this using Node.JS on the server or JavaScript in the browser.
* * * You may reference the main CSS files if you like, or name-space your CSS using a single ID so that you don't mess anything up. I do a little bit of both. I reference jQuery-ui styles, the main.css styles, and, when needed, module-specific styles. It seems to be easy to work this way.
* * * Given the nature of CSS, it's possible to use CSS defined within module outside of your module- or even in other modules.. That's a bad idea, because finding and changing that code is much more difficult. It's best to keep CSS for a module namespaced.
* **Share data** with other modules.
* * JavaScript files have a `share` member, similar to the `state` member mentioned above. Unlike `state`, the `share` object is exposed to sibling modules.
* * Modules may have child modules. When you fetch a module (using `this.fetch()` for children or `modules.fetch()` for top-level modules) you can access all members of the module's prototype. For example, you can access `state`, `share`, any HTML file, or anything explicitly exposed.

***

# API
## `window` exposed members
The following are global variables (you can often reference them without using `window.`)

#### `window.__SHARE__` (**RESTRICTED** Object)
> **WARNING:** `__SHARE__` is marked for removal. Always use `this.share` instead.

All modules reference `__SHARE__` with `this.share`. Though, `__SHARE__` currently exists and is exposed on global, DO NOT REFERENCE `__SHARE__` directly. 
 
#### `window.modules` (Object) 
The top-level modules are stored in `window.modules`. 
Modules must not be named any of the following: 
* `fetch`
* `share`
* `modules`
* `state`
* any reserved word (yield, return, for, while, in, with, etc)

#### `modules.fetch(String name)` (Function) 
Constructs a module named `name`. The first time the module is fetched, it's `loaded` property is set to `false`. Any subsequent calls, `loaded` is set to `true`.

#### `modules.share` (Object)
An object that is shared by all of the modules and constructed prototypes.

#### `modules.MODULE_NAME` (Constructor)
A reference to every **available** top-level module is referenced as a member of `modules`. 

> **Note:** There's no guarantee your module is **available**, so never instantiate your modules using `new modules.MODULE_NAME`. Always use `modules.fetch("MODULE_NAME")` instead. 

***

## Constructed Module Members
These are members available within your module. 
> For example, these members are available under `this` within `main.js` and any `.js` file in a sub-directory.

### `this.parent`
For top-level modules, `this.parent` is a reference to `window`. For child modules, `parent` is a reference to their nearest parent's prototype.

##### Example:
Assume a directory structure like so:
```
modules/
- foo/
- - modules/
- - - bar/
- - - - main.js
- - main.js
```
***`foo/main.js`***
```
let bar = this.modules.fetch('bar');
bar.parent === this; // true
```
***`foo/modules/bar/main.js`***
```
this.parent === window.modules.foo.prototype; // true
```

### `this.state`
An object used to share state with different files within the same module.

#### Example:
Assume a directory structure like so:
```
modules/
- food/
- - control/
- - - events.js
- - hook/
- - - comms.js
- - main.js
```
***`food/main.js`***
```
// Only load this file once:
if (this.loaded) {
    return;
}

// Create a property to store food:
this.state.food = 0;

// Instantiate comms and events
new this.hook.comms();
new this.control.events();
```
***`food/hook/comms.js`***
```
const self = this;
// Listen for the server to change the value of "food"
socket.on("food-change", amount => {
    // update state.food with the amount of "food" from server.
    self.state.food = amount;
});
```
***`food/control/events.js`***
```
const self = this;
// Listen for an input named "food" to change
$('#food input[name=food]').on('change', function (e) {
    // Update state.food with the value of the "food" input
    self.state.food = $(this).val();
});
```
The above module separates the concern of browser events from the concern of server events. The above is incomplete because we haven't yet listened for changes on state to sync the server and client. 

