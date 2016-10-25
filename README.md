# widget-build-tools

Generalized build lifecycle for Kambi widgets.

## Setup

```
npm install require-dir

npm install widget-build-tools

```

Replace the project gulpfile.js with:

```javascript
(function () {
   'use strict';

   var gulp = require('gulp');

   var requireDir = require('require-dir');

   var dir = requireDir('./node_modules/widget-build-tools/');

   //add or override your gulp tasks here

}).call(this);
```

If the widget needs extra steps in its build lifecycle custom gulp tasks can be added at the end of the file, gulp tasks from the build tools can also be overridden there as well.

## Configuration

To add specific locale strings create a file called `buildparameters.json` in the project directory:

__`buildparameters.json`__
```javascript
{
   "localeStrings": [
         {
            "Draw": "mostpopular.outcomeLabel.draw",
            ...
         }
      ]
}
```

Another configuration file is `resourcepaths.json`, this file is for configurations specific to the environment that the widget is going to be deployed to. As such it is ignored by git and should not be comited to the repository.

Each array object must contain key/value pairs, where key is the Label of the string used in template, and the value represents the object pointing to Kambi locale.js



__`resourcepaths.json`__
```javascript
{
   "third-party-libs": '//mydomain.com/widget-third-party/v1.2.0/thirdparty.min.js'
   "htmlReplace": {
       "myHtmlReplace": "//productionUrl.com/someScript.js"
   }
}
```

Unless you are building a widget with `gulp default-bundle` you need a resourcepaths.json file with the location of the third-party libraries ( https://github.com/kambi-sportsbook-widgets/widget-third-party ). A optional htmlReplace value can also be used, if present it will replace any tags commented like this:

```html
<!--build:myHtmlReplace-->
<script src="//developmentUrl.com/someScript.js"></script>
<!-- endbuild -->
```

with the value specified in the `resourcepaths.json` file. For example with the file described above that tag would be replaced with:

```html
<script src="//productionUrl.com/someScript.js"></script>
```





## Important Gulp Tasks

  `gulp default`

  Complete full clean build of the project. Copies basic configuration files (see this project `widget_config` folder) to the project

  `gulp default-bundle`

  Same as default but bundles the third party library file with the javascript files creating a "stand-alone" build. If this is used a `resourcepaths.json` is not required.

  `gulp compile`

  Compiles all sources into `src/transpiled/` folder, useful when developing

  `gulp watch`

  Watches any changes in the `src` folder and calls the appropriate compilation task

  `gulp clean`

  Cleans all temporary folders and files

  `gulp version-bump-*`

  Bumps the version of the project (in package.json), creates a tag and pushes those changes to origin:master. Valid values for * are: 'prerelease', 'patch', 'minor' and 'major'
