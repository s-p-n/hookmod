Hookmod
Hookmod is a lightweight front-end library that allows developers to manage and modularize their web projects with ease. It is designed to be simple and intuitive, so that developers can focus on creating their projects without worrying about the underlying organization of their code.

Installation
To use Hookmod in your project, simply include the hookmod.js file in your HTML file:

Copy code
<script src="path/to/hookmod.js"></script>
Usage
To create a new module with Hookmod, simply create a new folder within the hookmod_modules directory and add your HTML, CSS, and JS files. Hookmod will automatically detect these files and bind them to the corresponding module.

For example, if you have a module called myModule with the following files:

myModule/main.js
myModule/style.css
myModule/template.htm
You can access the CSS and HTML files within your JavaScript code like so:

Copy code
this.style // contains the contents of style.css
this.template // contains the contents of template.htm as a jQuery object
You can also include subfolders within your module to further organize your code. For example, if you have the following file structure:

myModule/main.js
myModule/ui/light.css
myModule/ui/dark.css
You can access the CSS files within your JavaScript code like so:

Copy code
this.ui.light // contains the contents of light.css
this.ui.dark // contains the contents of dark.css
In addition to binding your module's files to the corresponding object, Hookmod also provides a constructor function that is called when the module is first initialized. This can be useful for setting up your module's initial state or binding event listeners.

For example, if you have the following main.js file for your myModule:

Copy code
constructor() {
  // Set up event listeners
  $('#someButton').on('click', this.onButtonClick);
}

onButtonClick() {
  // Handle the button click event
}
Hookmod will automatically call the constructor function when the module is first initialized.

API
constructor()
The constructor function is called when the module is first initialized. This is a good place to set up your module's initial state or bind event listeners.

onFetch()
The onFetch function is called every time the module is fetched. This can be useful if you want to update your module's state or UI based on changes in the rest of the application.

Examples
Check out the examples directory for some example usage of Hookmod.

License
Hookmod is licensed under the MIT license. See the LICENSE file for more details.