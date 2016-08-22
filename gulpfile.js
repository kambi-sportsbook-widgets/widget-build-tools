(function () {
   'use strict';
   var gulp = require('gulp'),

      fs = require('fs'),

      rename = require('gulp-rename'),

      concat = require('gulp-concat'),

      uglify = require('gulp-uglify'),

      jshint = require('gulp-jshint'),

      insert = require('gulp-insert'),

      stripDebug = require('gulp-strip-debug'),

      sourcemaps = require('gulp-sourcemaps'),

      sass = require('gulp-ruby-sass'),

      cssnano = require('gulp-cssnano'),

      htmlReplace = require('gulp-html-replace'),

      del = require('del'),

      path = require('path'),

      gulpFile = require('gulp-file'),

      foreach = require('gulp-foreach'),

      json_merger = require('json_merger'),

      jsonminify = require('gulp-jsonminify'),

      babel = require('gulp-babel'),

      jscs = require('gulp-jscs'),

      vinylfs = require('vinyl-fs');

   var projectRoot = __dirname + '/../../';

   var transpileDir = projectRoot + '/src/transpiled/';

   var buildDir = projectRoot + '/dist/';

   var bundleThirdPartyLibraries = false;

   // All file paths used in the gulp file are inside this object
   var paths = {
      js: {
         source: projectRoot + '/src/js/',
         transpiled: transpileDir + '/js/',
         build: buildDir + '/js/',
         sourceRoot: '/js/',
         coreLibraryFile: projectRoot + '/node_modules/widget-core-library/dist/core.js',
         thirdPartyLibraryFile: projectRoot + '/node_modules/third-party-dependencies/dist/thirdparty.js'
      },
      css: {
         source: projectRoot + '/src/scss/',
         transpiled: transpileDir + '/css/',
         build: buildDir + '/css/',
         sourceRoot: '../../scss/'
      },
      i18n: {
         source: projectRoot + '/src/i18n/',
         coreLibrarySource: projectRoot + '/node_modules/widget-core-library/src/i18n/',
         transpiled: transpileDir + '/i18n/',
         build: buildDir + '/i18n/'
      },
      views: {
         source: projectRoot + '/src/views/*.html',
         transpiled: transpileDir + '/js/views/'
      },
      fonts: {
         source: projectRoot + '/node_modules/widget-core-library/src/fonts/**/*',
         transpiled: transpileDir + '/fonts/',
         build: buildDir + '/fonts/'
      },
      configFiles: [
         projectRoot + '/node_modules/widget-build-tools/widget_config/gitignore',
         projectRoot + '/node_modules/widget-build-tools/widget_config/.editorconfig',
         projectRoot + '/node_modules/widget-build-tools/widget_config/.jshintrc',
         projectRoot + '/node_modules/widget-build-tools/widget_config/.jscsrc',
         projectRoot + '/node_modules/widget-build-tools/widget_config/config.rb',
         projectRoot + '/node_modules/widget-build-tools/widget_config/LICENSE',
         projectRoot + '/node_modules/widget-build-tools/widget_config/.scss-lint.yml'
      ],
      staticFiles: [
         './src/**/*',
         '!./src/js/**',
         '!./src/js/',
         '!./src/scss/**',
         '!./src/scss/',
         '!./src/i18n/**',
         '!./src/i18n/',
         '!./src/transpiled/**',
         '!./src/transpiled/'
      ]
   };

   var buildParameters;
   try {
      buildParameters = JSON.parse(fs.readFileSync('./buildparameters.json'));
   } catch (e) {
      buildParameters = {};
   }

   var coreLibConfig, widgetConfig, buildToolsConfig, dependencyCoreLibVersion, dependencyBuildToolsVersion;
   try {
      coreLibConfig = JSON.parse(fs.readFileSync('./node_modules/widget-core-library/package.json'));
      widgetConfig = JSON.parse(fs.readFileSync('./package.json'));

      buildToolsConfig = JSON.parse(fs.readFileSync('./node_modules/widget-build-tools/package.json'));

      dependencyBuildToolsVersion = widgetConfig.devDependencies['widget-build-tools'].split('#')[1];
      if (dependencyBuildToolsVersion.charAt(0) === 'v') {
         dependencyBuildToolsVersion = dependencyBuildToolsVersion.slice(1);
      }

      dependencyCoreLibVersion = widgetConfig.devDependencies['widget-core-library'].split('#')[1];
      if (dependencyCoreLibVersion.charAt(0) === 'v') {
         dependencyCoreLibVersion = dependencyCoreLibVersion.slice(1);
      }
   } catch (e) {
      throw new Error('Could not read package.json of the widget or one of its dependencies');
   }

   if (dependencyCoreLibVersion !== coreLibConfig.version) {
      throw new Error(
         'widget-core-library dependency does not match node_modules dependency version. Expected: ' +
         dependencyCoreLibVersion +
         ' got ' +
         coreLibConfig.version +
         ' \nPlease run npm install (not npm update!)');
   }

   if (dependencyBuildToolsVersion !== buildToolsConfig.version) {
      throw new Error(
         'widget-build-tools dependency does not match node_modules dependency version. Expected: ' +
         dependencyBuildToolsVersion +
         ' got ' +
         buildToolsConfig.version +
         ' \nPlease run npm install (not npm update!)');
   }

   /**
    * Copies project configuration files from the build tools into the project
    */
   gulp.task('copy-config-files', function () {
      return gulp.src(paths.configFiles)
         .pipe(rename(function ( path ) {
            // .gitignore has special handling because npm strips .gitignore files
            // when downloading dependencies
            if ( path.basename === 'gitignore' ) {
               path.basename = '.gitignore';
            }
         }))
         .pipe(vinylfs.dest(projectRoot, { overwrite: true })); // same as gulp.dest, but accepts an overwrite flag
   });

   gulp.task('clean-temp', function () {
      return del.sync(transpileDir);
   });

   gulp.task('generate-mock-data', function () {
      return gulp.src([projectRoot + '/node_modules/widget-build-tools/widget_config/mockSetupData.json'])
          .pipe(vinylfs.dest(transpileDir, { overwrite: false }));
   });

   /**
    * Cleans the project (deletes transpileDir and buildDir folders)
    */
   gulp.task('clean', ['clean-temp'], function () {
      return del.sync(buildDir);
   });

   /**
    * Cleans then builds
    */
   gulp.task('default', ['clean'], function () {
      return gulp.start('build');
   });

   /**
    * Same as default but bundles the third party library file with
    * the javascript file
    */
   gulp.task('default-bundle', ['clean'], function () {
      bundleThirdPartyLibraries = true;
      return gulp.start('build');
   });

   /**
    * Tasks used by 'build' to run everything in the right order
    */
   gulp.task('build2', ['copy-config-files', 'generate-mock-data'], function () {
      return gulp.start('build3');
   });
   gulp.task('build3', ['compile'], function () {
      return gulp.start('build4');
   });
   gulp.task('build4', ['bundle-static', 'bundle-css', 'bundle-js', 'bundle-fonts'], function () {
      return gulp.start('build5');
   });
   gulp.task('build5', ['html-replace']);

   /**
    * Full build cycle with compilling and minifying
    */
   gulp.task('build', ['build2']);

   /**
    * Replaces references inside index.html to reference the minified and concatanated
    * js and css files
    */
   gulp.task('html-replace', function () {
      var resourcePaths;
      try {
         resourcePaths = JSON.parse(fs.readFileSync('./resourcepaths.json'));
      } catch (e) {
         if (bundleThirdPartyLibraries) {
            resourcePaths = {};
         } else {
            throw new Error('could not read resourcepaths.json');
         }
      }
      if (resourcePaths.htmlReplace == null) {
         resourcePaths.htmlReplace = {};
      }

      var kambiAPIVersion = coreLibConfig['kambi-widget-api-version'] != null ? coreLibConfig['kambi-widget-api-version'] : '1.0.0.10';

      var kambiWidgetAPIUrl = 'https://c3-static.kambi.com/sb-mobileclient/widget-api/{{API_VERSION}}/kambi-widget-api.js'
         .replace('{{API_VERSION}}', kambiAPIVersion);

      var references = {
         js: 'js/app.min.js',
         css: 'css/app.min.css',
         'kambi-widget-api': kambiWidgetAPIUrl
      };
      if (!bundleThirdPartyLibraries) {
         references['third-party-libs'] = resourcePaths.thirdPartyLibs;
      }

      references = extendObj(
         references,
         resourcePaths.htmlReplace
      );
      return gulp.src('./src/index.html')
         .pipe(htmlReplace(references))
         .pipe(gulp.dest('./dist'));
   });

   /**
    * Compiles all scss files and places them in {transpileDir}/css/ folder
    */
   gulp.task('compile-scss', [], function () {
      return sass(paths.css.source + 'app.scss', {
            compass: true,
            style: 'expanded',
            lineComments: false,
            sourcemap: true
         })
         .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot: paths.css.sourceRoot
         }))
         .pipe(gulp.dest(paths.css.transpiled));
   });

   /**
    * Compiles all js files using Babel and places them in {transpileDir} folder
    */
   gulp.task('compile-babel', [], function () {
      var sourceRootMap = function (file) {
         return '../' + path.relative(file.history[0], paths.js.source) + paths.js.sourceRoot;
      };
      return gulp.src(paths.js.source + '/**/*.js')
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('default'))
         .pipe(jscs())
         .pipe(jscs.reporter())
         .pipe(sourcemaps.init())
         .pipe(babel({
            presets: ['es2015']
         }))
         .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot: sourceRootMap
         }))
         .pipe(gulp.dest(paths.js.transpiled));
   });

   /**
    * Copies all static files (.html, .json, images) to transpileDir folder, i18n files are handled
    * by the compile-translations task
    */
   gulp.task('compile-static', [], function () {
      return gulp.src(paths.staticFiles)
         .pipe(gulp.dest(transpileDir));
   });

   /**
    * Transforms all .html files from /src/views into javascript files
    * that add the content of the original files as strings in global
    * names defined by the original file name
    */
   gulp.task('compile-views', [], function () {
      return gulp.src(paths.views.source)
         .pipe(foreach(function ( stream, file ) {
            var name = path.basename(file.path);
            name = name.slice(0, -5);
            return stream
               .pipe(insert.prepend('window["' + name + '-view' + '"] = `'))
               .pipe(insert.append('`;'));
         }))
         .pipe(rename(function (path) {
            path.extname = '.js';
         }))
         .pipe(babel({ // babel does the scaping of the file convertin `` to ""
            presets: ['es2015']
         }))
         .pipe(gulp.dest(paths.views.transpiled));
   });

   /**
    * Copies all fonts from widget-core-library to transpileDir
    */
   gulp.task('compile-fonts', [], function () {
      return gulp.src(paths.fonts.source)
         .pipe(gulp.dest(paths.fonts.transpiled));
   });

   /**
    * Compiles all js, scss and i18n files and place them (alongside static files) in the dist
    * folder
    */
   gulp.task('compile', [
      'compile-babel',
      'compile-scss',
      'compile-translations',
      'compile-static',
      'compile-views',
      'compile-fonts'
   ]);

   /**
    * Watches for any change in the files inside /src/ folder and recompiles them
    */
   gulp.task('watch', [], function () {
      gulp.watch(paths.js.source + '/**/*.js', ['compile-babel']);
      gulp.watch(paths.css.source + '/**/*.scss', ['compile-scss']);
      gulp.watch(paths.i18n.source + '/**/*.json', ['compile-translations']);
      gulp.watch(paths.staticFiles, ['compile-static']);
      gulp.watch(paths.views.source, ['compile-views']);
      gulp.watch(paths.fonts.source, ['compile-fonts']);
   });

   /**
    * Minifies and concatenates all css files from {transpileDir} into {buildDir}
    */
   gulp.task('bundle-css', function () {
      return gulp.src(paths.css.transpiled + '/**/*.css')
         .pipe(concat('app.css'))
         .pipe(gulp.dest(paths.css.build))
         .pipe(cssnano({
            autoprefixer: false // If true removes older browser prefixes from code
         }))
         .pipe(rename('app.min.css'))
         .pipe(gulp.dest(paths.css.build));
   });

   /**
    * Minifies and concatenates all js files from {transpileDir} into {buildDir}
    */
   gulp.task('bundle-js', function () {
      var files = [
         paths.js.coreLibraryFile,
         paths.js.transpiled + '**/*.js'
      ];
      if (bundleThirdPartyLibraries) {
         files = [paths.js.thirdPartyLibraryFile].concat(files);
      }
      return gulp.src(files)
         .pipe(concat('app.js'))
         .pipe(stripDebug())
         .pipe(gulp.dest(paths.js.build))
         .pipe(uglify())
         .pipe(rename('app.min.js'))
         .pipe(gulp.dest(paths.js.build));
   });

   /**
    * Copies all static files (.html, .json, images) to buildDir folder, i18n files are handled
    * by the compile-translations task
    */
   gulp.task('bundle-static', [], function () {
      return gulp.src(paths.staticFiles)
         .pipe(gulp.dest(buildDir));
   });

   /**
    * Copies all font files from widget-core-library to buildDir folder
    */
   gulp.task('bundle-fonts', [], function () {
      return gulp.src(paths.fonts.source)
         .pipe(gulp.dest(paths.fonts.build));
   });

   /**
    * Merges widget i18n files with cherry-picked strings from the widget-core-library
    */
   gulp.task('compile-translations', function () {
      return gulp.src(paths.i18n.source + '/**/*.json')
         .pipe(foreach(function ( stream, file ) {
            var name = path.basename(file.path);
            var filePath = paths.i18n.coreLibrarySource + name;
            var srcJson = JSON.parse(file.contents.toString());
            var selectedFromKambi = {};

            try {
               fs.statSync(filePath); // throws error if file does not exist
               var coreLibraryJson = json_merger.fromFile(filePath);

               // buildParameters.localeStrings should be an object in the following format:
               // { "keyInI18nJSON": "pathToValueInKambiI18nJSON" }
               if (buildParameters.localeStrings != null) {
                  Object.keys(buildParameters.localeStrings).forEach(function ( key ) {
                     // creates a new function that retrieves the string specified by the path in localeStrings from the localeJson
                     /* jslint evil: true */
                     selectedFromKambi[key] = new Function('json', 'return json.' + buildParameters.localeStrings[key])(coreLibraryJson);
                  });
               }

               var result = extendObj(srcJson, selectedFromKambi);
               // TODO find a way to make this synchronous:
               gulpFile(name, JSON.stringify(result, null, 3), { src: true })
                  .pipe(gulp.dest(paths.i18n.transpiled))
                  .pipe(jsonminify())
                  .pipe(gulp.dest(paths.i18n.build));
            } catch (e) {
               console.warn('Warning: could not merge i18n file named: ' + name + ' with core file');
               console.warn(e);
               // TODO find a way to make this synchronous:
               // copying without merging
               gulp.src(paths.i18n.source + name)
                  .pipe(gulp.dest('./' + transpileDir + '/i18n/'))
                  .pipe(jsonminify())
                  .pipe(gulp.dest(paths.i18n.source.build));
            }

            return stream;
         }));
   });

   function extendObj ( obj, src ) {
      Object.keys(src).forEach(function ( key ) {
         obj[key] = src[key];
      });
      return obj;
   }

}).call(this);
