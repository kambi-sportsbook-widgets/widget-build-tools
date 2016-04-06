# widget-build-tools

Generalized build lifecycle for Kambi widgets.

## Setup

```
npm add require-dir

npm add git+ssh://git@github.com:kambi-sportsbook-widgets/widget-build-tools.git

npm install
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

Create a file called buildparameters.json in the project directory.
__`buildparameters.json`__
```javascript
{
   "coreLibraryBaseUrl": "//kambi-cdn.globalmouth.com/lib/dist/", // Change this to the url of the build version of core library
   "coreLibraryCSS": [
      "css/app-base-all.css",
      "css/widgets.css",
      "css/app-icons.css"
   ],
   "coreLibraryJS": [
      "js/app.min.js"
   ],
   "thirdPartyBaseUrl": "//ajax.googleapis.com/ajax/libs/angularjs/1.4.5/",  // The location you want to load the third part libraries from
   "thirdPartyLibs": [
      "angular.min.js",
      "angular-animate.min.js",
      "angular-sanitize.min.js"
   ],
   "htmlReplace": {
      "translate": "//kambi-cdn.globalmouth.com/translate/dist/translate.min.js" // If the widget requires the translate module, link it here
   },
   "awsPublishPath": "livenow"
}
```

### To add specific locale strings to be compiled add the following to the buildparameters.json.
Each array object must contain key/value pairs, where key is the Label of the string used in template, and the value
represents the object pointing to Kambi locale.js

```json
"localeStrings": [
      {
         "Draw": "mostpopular.outcomeLabel.draw",
         ...
         ..
      }
   ]
```

## Important Gulp Tasks

  `gulp default`

  Complete full clean build of the project. Copies basic configuration files (see this project `widget_config` folder) to the project

  `gulp compile`

  Compiles all sources into `/.compiledTemp/` folder, useful when developing

  `gulp watch`

  Watches any changes in the `src` folder and calls the appropriate compillation task

  `gulp clean`

  Cleans all temporary folders and files

  `gulp version-bump-*`

  Bumps the version of the project (in package.json), creates a tag and pushes those changes to origin. Valid values for * are: 'prerelease', 'patch', 'minor' and 'major'
