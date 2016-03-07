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
