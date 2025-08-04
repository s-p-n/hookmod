# HookMod: Quick Start Guide

**HookMod** is a lightweight framework for building modular web applications. It organizes your code into reusable, hierarchical modules, making it easy to create scalable, maintainable projects. With HookMod, you can:

- Build reusable components for rapid prototyping or complex apps.
- Create nested sub-modules for organized, hierarchical code.
- Share data within and across modules for dynamic features.
- Integrate styles and templates for rich, interactive UIs.

Whether you're crafting a small tool or a large-scale application, HookMod keeps your code structured and flexible. Let’s get started!

---

[![Watch the video](https://img.youtube.com/vi/UOQC_0dQfuo/maxresdefault.jpg)](https://youtu.be/UOQC_0dQfuo)


## What You Need to Know

- **Modules**: Each module is a folder with a required `main.js` file and optional `.js`, `.css`, `.htm`, or `.json` files.
- **Sub-Modules**: Modules can contain a `modules` subfolder with nested modules that inherit from their parent.
- **Purpose**: Break your app into small, reusable pieces with clear setup and lifecycle hooks.

---

## Setup: Get HookMod Running

1. **Install HookMod**  
   HookMod is a Node.js package. Install it globally or locally:
   ```bash
   npm install -g hookmod
   ```
   Or, for a local project:
   ```bash
   npm install hookmod
   ```

2. **Create Your Module Structure**  
   Set up a `modules` directory with module folders (see Step 1 below).

3. **Generate `hookmod.js`**  
   Use the `hookmod` CLI to bundle your modules into a single `hookmod.js` file during a build step:
   ```bash
   hookmod ./modules ./public/js/hookmod.js
   ```
   - `./modules`: Path to your modules directory.
   - `./public/js/hookmod.js`: Output file path.

   Alternatively, use a script to watch for changes and auto-recompile (see example below).

4. **Include in Your HTML**  
   Add the generated `hookmod.js` to your HTML:
   ```html
   <script src="/js/hookmod.js"></script>
   ```

**Example Watch Script**  
To automatically recompile `hookmod.js` when files change, save this as `build.js`:
```javascript
const { watch, writeFileSync } = require('fs');
const { join } = require('path');
const HookMod = require('hookmod');

const modulesDir = join(__dirname, 'modules');
const outputFile = join(__dirname, 'public/js/hookmod.js');

async function compile() {
  const hookmod = new HookMod({ modulesDirectory: modulesDir });
  await hookmod.writeTo(outputFile);
  console.log('Modules compiled to', outputFile);
}

compile(); // Initial compile

watch(modulesDir, { recursive: true }, () => {
  console.log('Changes detected, recompiling...');
  compile();
});

console.log('Watching for changes...');
```
Run it with:
```bash
node build.js
```

### Debugging with Source Maps
- **How It Works**: HookMod automatically generates source maps during bundling (`hookmod.js.map`), mapping the concatenated `hookmod.js` back to original files (main.js, .htm, .css, .js, .json). This allows runtime errors in browser DevTools to point to the exact line in the source file.
- **Usage**: Open your app in a browser with DevTools (e.g., Chrome F12). Errors in templates (.htm), styles (.css), utilities (.js), or data (.json) will map to the original file and line.
- **Limitations**: Syntax errors in .js or .json throw during build or in the generated file before maps activate. Runtime errors (e.g., undefined variables in templates) map correctly.
- **Tips**: Enable source maps in DevTools settings (Sources > Enable JavaScript source maps). For dynamic templates (.htm), use `${this.prop}` placeholders—errors map to the template line.

---

## Step 1: Set Up Your Modules

1. Create a root folder (e.g., `./modules/`).
2. Add module folders inside it (e.g., `foo`, `bar`).
   - **Important**: Folder names must be valid JavaScript variable names (letters, numbers, `_`, no starting with numbers). This name becomes your module’s identifier.
3. Add a `main.js` file in each module folder.
4. (Optional) Add a `modules` subfolder for sub-modules.

**Example**:
```
- modules
  - foo
    - main.js
    - modules
      - subfoo
        - main.js
  - bar
    - main.js
```

---

## Step 2: Write `main.js`

HookMod turns your `main.js` into a class named after the folder (e.g., `foo` for `/foo/main.js`). Write methods and properties directly—no `class` or `export` needed.

### Example:
```javascript
// modules/foo/main.js
constructor() {
  console.log("Foo module loaded!");
}

onFetch() {
  console.log("Foo module fetched!");
}

sayHello() {
  return "Hello from Foo!";
}
```

### Sub-Module Example:
For `/foo/modules/subfoo/main.js`:
```javascript
// modules/foo/modules/subfoo/main.js
constructor() {
  console.log("SubFoo loaded, parent is:", this.parent.constructor.name);
}

greet() {
  return "Hello from SubFoo!";
}
```

### Key Methods:
- **`constructor()`**: Runs once when the module loads. Use for setup (e.g., styles, DOM).
- **`onFetch()`**: Runs every time the module is fetched. Use for updates.

### Rules:
- Don’t use `class` or `export`—HookMod handles that.
- Keep logic inside methods—loose variables or functions won’t work.
- Sub-modules can call parent methods directly via `this` (e.g., `this.sayHello()`).

---

## Step 3: Fetch Your Module

Load and use your module with `modules.fetch('moduleName')`:
```javascript
const foo = modules.fetch('foo');
console.log(foo.sayHello()); // "Hello from Foo!"

// Fetching a sub-module from within the parent
const subFoo = foo.modules.fetch('subfoo');
console.log(subFoo.greet()); // "Hello from SubFoo!"
```

- **First fetch**: Runs `constructor()` + `onFetch()`.
- **Later fetches**: Runs only `onFetch()`.
- **Note**: Use `modules.fetch()`, not `new modules.foo()`.

**Sub-Module Access**:
- To fetch a sub-module from within the parent module, use `this.modules.fetch('subfoo')`. This ensures proper initialization and caching.
- Sub-modules inherit from the parent's prototype, so they can call the parent's methods directly via `this` (e.g., `this.sayHello()`).

---

## Step 4: Add Optional Files

Enhance your module with subfolders containing `.js`, `.css`, `.htm`, or `.json` files. These files are processed and attached to your module’s prototype, making them accessible within your module’s methods.

### Using CSS Files
- **How It Works**: CSS files are read as strings and attached to the module (e.g., `this.ui.styles`).
- **Usage**: Inject the CSS string into the document to apply styles.

**Example**:
```javascript
constructor() {
  const style = document.createElement('style');
  style.textContent = this.ui.styles;
  document.head.appendChild(style);
}
```

### Using HTM Files for Dynamic Templates
- **How It Works**: HTM files are processed into functions that return DOM elements. They support dynamic content using JavaScript template literals (e.g., `${this.property}`) and preserve whitespace for readability.
- **Usage**: Call the template function with an object containing the properties used in the template.

**Example**:
**Template File**:
```
<!-- modules/Article/ui/article.htm -->
<div id="${this.node_id}">
  <h3>${this.title}</h3>
  <p>${this.content}</p>
</div>
```

**Module Code**:
```javascript
// modules/Article/main.js
#articles = [];

constructor() {
  // Initialize styles or other setup
  // Create a test article
  let article = this.createArticle('Hello, World!', 'This is a test article');
  document.body.appendChild(article.node); // Append to DOM
}

createArticle(title, content) {
  let index = this.#articles.push({ title, content }) - 1;
  let article = this.#articles[index];
  article.node_id = `article-${index}`;
  article.node = this.ui.article.call(article); // Render template with article data
  return article;
}
```

- **Dynamic Placeholders**: Use `${this.property}` to insert data (e.g., `node_id`, `title`, `content`).
- **Whitespace Preservation**: Indentation and line breaks in the HTM file are preserved for readability.
- **Rendering**: `this.ui.article.call(article)` sets `this` to the `article` object, replacing placeholders with its properties.
- **Output**: A DOM element with dynamic content, ready to append to the document.

**Tips**:
- Ensure all properties used in the template are defined on the object passed to the template function.
- Use vanilla JavaScript or jQuery to manipulate the rendered nodes.

### Using Additional JS Files
- **How It Works**: JS files in subfolders become methods or properties (e.g., `/lib/utils.js` → `this.lib.utils()`).
- **Usage**: Call these functions from your module’s methods for additional logic.

**Example**:
```javascript
// lib/utils.js
return function() {
  return "Utility function executed!";
};
```

```javascript
runUtility() {
  console.log(this.lib.utils()); // "Utility function executed!"
}
```

### Using JSON Files
- **How It Works**: JSON files are attached as objects or arrays (e.g., `/data/config.json` → `this.data.config`).
- **Usage**: Access the data directly in your methods for configuration or static data.

**Example**:
```json
// data/config.json
{
  "theme": "dark",
  "apiUrl": "https://example.com/api"
}
```

```javascript
constructor() {
  console.log(this.data.config.theme); // "dark"
}
```

**Note**: For most use cases, combining sibling modules with optional `.js`, `.css`, `.htm`, and `.json` files is sufficient. Sub-modules are useful when you need to share state or create a sub-hierarchy of related components.

---

## Step 5: Share Data

- **Within a Module**: Use `this.state` for persistent data:
  ```javascript
  constructor() {
    this.state.count = 0;
  }

  increment() {
    this.state.count++;
    return this.state.count;
  }
  ```
- **Between Modules**: Use `this.share` for global data:
  ```javascript
  // In module 'foo'
  this.share.appName = "My App";

  // In module 'bar'
  console.log(this.share.appName); // "My App"
  ```
- **Parent-Child Interaction**: Sub-modules can access the parent's prototype methods directly:
  ```javascript
  // In /foo/modules/subfoo/main.js
  callParentMethod() {
    return this.sayHello(); // Calls Foo’s sayHello method
  }
  ```
  - **Note**: `this.parent` refers to the parent module's prototype, not the instance. Use it to access shared properties or methods.

---

## Avoid These Mistakes

- Writing `class` or `export` in `main.js`.
- Adding code outside methods (e.g., top-level variables).
- Expecting `constructor()` to run every fetch—use `onFetch()`.
- Confusing `this.parent` with the parent's instance. `this.parent` is the parent's prototype.
- Forgetting to define properties in objects passed to templates (.htm) or utilities (.js).

---

## Quick Tips

- Treat `main.js` as a class body.
- Use `constructor()` for setup, `onFetch()` for updates.
- Keep module names valid (e.g., `greeter`, not `123greeter`).
- Use sub-modules to organize complex functionality.
- Check the console for errors if something’s off.
- For dynamic templates (.htm), use `${this.prop}` placeholders—errors map to the template line.

---

## Basic API

- **`modules.fetch('name')`**: Get a module instance.
- **`this.state`**: Store data within a module.
- **`this.share`**: Share data across modules.
- **`this.parent`**: Refers to the parent module's prototype (for sub-modules).
- **Module Structure**:
  - `.js` → Methods/properties.
  - `.css` → Stringified styles.
  - `.htm` → jQuery-parsed templates with dynamic placeholders.
  - `.json` → Literal objects/arrays.
  - `modules/` → Sub-modules.

---

## What Can You Build?

HookMod’s modular design supports a wide range of web apps:
- **Interactive Tools**: Create calculators or dashboards with reusable logic.
- **Dynamic UIs**: Use `.htm` templates and `.css` styles for rich interfaces.
- **Hierarchical Apps**: Use sub-modules for complex, nested functionality.
- **Collaborative Projects**: Share data via `this.share` for team-friendly code.

Check out the [HookMod repository](https://github.com/s-p-n/hookmod) for examples and source code. Happy coding!
