(function () {
   'use strict';
   var gulp = require('gulp'),

      fs = require('fs'),

      rename = require('gulp-rename'),

      concat = require('gulp-concat'),

      uglify = require('gulp-uglify'),

      color = require('cli-color'),

      notify = require('gulp-notify'),

      jshint = require('gulp-jshint'),

      stripDebug = require('gulp-strip-debug'),

      sourcemaps = require('gulp-sourcemaps'),

      sass = require('gulp-ruby-sass'),

      cssnano = require('gulp-cssnano'),

      htmlReplace = require('gulp-html-replace'),

      del = require('del'),

      replace = require('gulp-replace'),

      install = require('gulp-install'),

      path = require('path'),

      gulpFile = require('gulp-file'),

      foreach = require('gulp-foreach'),

      json_merger = require('json_merger'),

      jsonminify = require('gulp-jsonminify'),

      merge_stream = require('merge-stream'),

      run_sequence = require('run-sequence'),

      babel = require('gulp-babel'),

      jscs = require('gulp-jscs'),

      download = require('gulp-download-stream'),

      supportLanguagesFiles = [],

      buildTemp = '.buildTemp',

      compiledTemp = '.compiledTemp';

   var buildParameters = JSON.parse(fs.readFileSync('./buildparameters.json')),
      coreLibraryFolder = './node_modules/widget-core-library/src/i18n/',
      supportLanguages = [
         'cs_CZ',
         'da_DK',
         'de_AT',
         'de_CH',
         'de_DE',
         'el_GR',
         'en_AU',
         'en_GB',
         'es_ES',
         'et_EE',
         'fi_FI',
         'fr_BE',
         'fr_CH',
         'fr_FR',
         'hu_HU',
         'it_IT',
         'lt_LT',
         'lv_LV',
         'nl_BE',
         'nl_NL',
         'no_NO',
         'pl_PL',
         'pt_BR',
         'pt_PT',
         'ro_RO',
         'ru_RU',
         'sv_SE',
         'tr_TR'
      ];

   /**
    * Copies project configuration files from the build tools into the project
    * The files are: .gitignore, .jshintrc, .editorconfig, config.rb
    */
   gulp.task('copy-config-files', function () {
      // .gitignore has special handling because npm strips .gitignore files
      // when downloading dependencies
      return gulp.src([
            './node_modules/widget-build-tools/widget_config/gitignore',
            './node_modules/widget-build-tools/widget_config/.editorconfig',
            './node_modules/widget-build-tools/widget_config/.jshintrc',
            './node_modules/widget-build-tools/widget_config/.jscsrc',
            './node_modules/widget-build-tools/widget_config/config.rb',
            './node_modules/widget-build-tools/widget_config/LICENSE'
         ])
         .pipe(rename(function ( path ) {
            if ( path.basename === 'gitignore' ) {
               path.basename = '.gitignore';
            }
         }))
         .pipe(gulp.dest('./'));
   });

   gulp.task('clean-temp', function () {
      del.sync(compiledTemp);
      return del.sync(buildTemp);
   });

   /**
    * Cleans the project (deletes compiledTemp, /dist/ and buildTemp folders)
    */
   gulp.task('clean', ['clean-temp'], function () {
      del.sync('dist');
   });

   /**
    * Cleans then builds
    */
   gulp.task('default', ['clean'], function () {
      return gulp.start('build');
   });

   /**
    * Tasks used by 'build' to run everything in the right order
    */
   gulp.task('build2', ['copy-config-files'], function () {
      gulp.start('build3');
   });
   gulp.task('build3', ['compile'], function () {
      gulp.start('build4');
   });
   gulp.task('build4', ['html-replace', 'css-concat', 'js-concat']);

   /**
    * Full build cycle with compilling and minifying
    */
   gulp.task('build', ['build2']);

   /**
    * Replaces references inside index.html to reference the minified and concatanated
    * js and css files
    */
   gulp.task('html-replace', function () {

      var thirdPartyLibs = [], coreLibraryCSS = [], coreLibraryJS = [], i;

      if ( buildParameters.thirdPartyLibs != null ) {
         for ( i = 0; i < buildParameters.thirdPartyLibs.length; i++ ) {
            thirdPartyLibs.push(buildParameters.thirdPartyBaseUrl + buildParameters.thirdPartyLibs[i]);
         }
      }

      if ( buildParameters.coreLibraryCSS != null ) {
         for ( i = 0; i < buildParameters.coreLibraryCSS.length; i++ ) {
            coreLibraryCSS.push(buildParameters.coreLibraryBaseUrl + buildParameters.coreLibraryCSS[i]);
         }
      }

      if ( buildParameters.coreLibraryJS != null ) {
         for ( i = 0; i < buildParameters.coreLibraryJS.length; i++ ) {
            coreLibraryJS.push(buildParameters.coreLibraryBaseUrl + buildParameters.coreLibraryJS[i]);
         }
      }

      var coreLibConfig = JSON.parse(fs.readFileSync('./node_modules/widget-core-library/package.json'));

      var kambiAPIVersion = coreLibConfig['kambi-widget-api-version'] != null ? coreLibConfig['kambi-widget-api-version'] : '1.0.0.8';

      var kambiWidgetAPIUrl = 'https://c3-static.kambi.com/sb-mobileclient/widget-api/{{API_VERSION}}/kambi-widget-api.js'
         .replace('{{API_VERSION}}', kambiAPIVersion);

      var references = extendObj(
         {
            css: 'css/app.min.css',
            js: 'js/app.min.js',
            'kambi-widget-api': kambiWidgetAPIUrl,
            coreLibraryCSS: coreLibraryCSS,
            thirdPartyLibs: thirdPartyLibs,
            corelib: coreLibraryJS
         },
         buildParameters.htmlReplace
      );
      return gulp.src('./' + compiledTemp + '/index.html')
         .pipe(htmlReplace(references))
         .pipe(gulp.dest('./dist'));
   });

   /**
    * Compiles all scss files and places them in {compiledTemp}/css/ folder
    */
   gulp.task('compile-scss', [], function () {
      var scssStream = sass('./src/scss/app.scss', {
         compass: true,
         style: 'expanded',
         lineComments: false,
         sourcemap: true
      })
         .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot: '../css/src/scss'
         }))
         .pipe(gulp.dest('./' + compiledTemp + '/css'));

      var sourceStream = gulp.src('./src/**/*.scss')
         .pipe(gulp.dest('./' + compiledTemp + '/css/src/'));

      return merge_stream(scssStream, sourceStream);
   });

   /**
    * Compiles all js files using Babel and places them in {compiledTemp} folder
    */
   gulp.task('compile-babel', [], function () {
      // TODO add babel compilation step once chrome sourcemap bug gets fixed
      // https://bugs.chromium.org/p/chromium/issues/detail?id=369797
      // var babelStream = gulp.src('./src/**/*.js')
      //    .pipe(jshint('.jshintrc'))
      //    .pipe(jshint.reporter('default'))
      //    .pipe(sourcemaps.init())
      //    .pipe(babel({
      //       presets: ['es2015'],
      //       sourceRoot: '../src/'
      //    }))
      //    .pipe(concat('app.js'))
      //    .pipe(sourcemaps.write('.'))
      //    .pipe(gulp.dest('./'+ compiledTemp +'/js/'));
      // var sourceStream = gulp.src('./src/**/*.js')
      //    .pipe(gulp.dest('./'+ compiledTemp +'/js/src/'));
      // return merge_stream(babelStream, sourceStream);

      return gulp.src('./src/**/*.js')
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('default'))
         .pipe(jscs())
         .pipe(jscs.reporter())
         .pipe(gulp.dest('./' + compiledTemp));
   });

   /**
    * Copies all static files (.html, .json, images) to compiledTemp folder, i18n files are handled
    * by the translations task
    */
   gulp.task('compile-static', [], function () {
      return gulp
         .src([
            './src/**/*',
            '!./src/js/**',
            '!./src/js/',
            '!./src/scss/**',
            '!./src/scss/',
            '!./src/i18n/**',
            '!./src/i18n/'
         ])
         .pipe(gulp.dest('./' + compiledTemp))
         .pipe(gulp.dest('./dist/'));
   });

   /**
    * Merges the i18n files from ./src/i18n/ with widget-core-library i18n files
    */
   gulp.task('compile-translations', ['translations']);

   /**
    * Compiles all js, scss and i18n files and place them (alongside static files) in the dist
    * folder
    */
   gulp.task('compile', ['compile-babel', 'compile-scss', 'compile-static', 'compile-translations']);

   /**
    * Watches for any change in the files inside /src/ folder and recompiles them
    */
   gulp.task('watch', [], function () {
      gulp.watch('src/**/*.js', ['compile-babel']);
      gulp.watch('src/**/*.scss', ['compile-scss']);
      gulp.watch('src/i18n/*.json', ['compile-translations']);
      gulp.watch(['./src/**/*', '!./src/**/*.js', '!./src/**/*.scss', '!./src/i18n/**'], ['compile-static']);
   });

   /**
    * Minifies and concatenates all css files from {compiledTemp} and places them in the dist folder
    */
   gulp.task('css-concat', function () {
      return gulp.src('./' + compiledTemp + '/css/**/*.css')
         .pipe(concat('app.css'))
         .pipe(gulp.dest('./dist/css'))
         .pipe(cssnano())
         .pipe(rename('app.min.css'))
         .pipe(gulp.dest('./dist/css'));
   });

   /**
    * Concatanates all the js files in the compiledTemp folder into {buildTemp}/app.js
    */
   gulp.task('app-concat', function () {
      return gulp.src('./' + compiledTemp + '/**/*.js')
         .pipe(concat('app.js'))
         .pipe(gulp.dest('./' + buildTemp + '/js'));
   });

   /**
    * Concatanates and minifies all js files in {buildTemp} into /dist/js/app.min,js
    */
   gulp.task('js-concat', ['app-concat'], function () {
      return gulp.src('./' + buildTemp + '/**/*.js')
         .pipe(concat('app.js'))
         .pipe(stripDebug())
         .pipe(gulp.dest('./dist/js'))
         .pipe(uglify())
         .pipe(rename('app.min.js'))
         .pipe(gulp.dest('./dist/js'));
   });

   /**
    * Main translation task. Grabs existent locale files, minifies them and copies them in the dist folder
    */
   gulp.task('translations', ['translations-merge'], function () {
      del.sync('./dist/i18n/');
      return gulp.src('./src/i18n/*.json')
         .pipe(jsonminify())
         .pipe(gulp.dest('./dist/i18n/'));
   });

   /**
    * Fetches the locales into widget-core-library module. Deletes existing locales in the widget-core-library
    */
   gulp.task('translations-get-locales', function () {
      supportLanguages.forEach(function ( locale ) {
         supportLanguagesFiles.push({
            file: locale + '.json',
            url: 'https://publictest-static.kambi.com/sb-mobileclient/kambi/1.245.0.0//locale/' + locale + '/locale.js'
         });
      });
      // Delete the src/i18n files
      del.sync(coreLibraryFolder);
      return download(supportLanguagesFiles)
         .pipe(gulp.dest(coreLibraryFolder));
   });

   /**
    * Prepares the json output
    */
   gulp.task('translations-to-json', function () {
      return gulp.src('./node_modules/widget-core-library/src/i18n/*.json')
         .pipe(replace('(function(require, define){\ndefine({', '{\n\t"LOCALE_IMPORT": "---",'))
         .pipe(replace(');})(_kbc.require, _kbc.define);', ''))
         .pipe(gulp.dest(coreLibraryFolder));
   });

   /**
    * Cleans the source locales
    */
   gulp.task('translations-clear-src', function () {
      return gulp.src('./src/i18n/*.json')
         .pipe(replace(/(,||\s)+"LOCALE_IMPORT":(\s||.)"---"(\s||.)+/g, '\n}'))
         .pipe(gulp.dest('./src/i18n/'));
   });

   /**
    * Merges widget locales with cherry-picked strings from Kambi translation files
    */
   gulp.task('translations-merge', ['translations-clear-src', 'translations-to-json'], function () {
      return gulp.src('./src/i18n/*.json')
         .pipe(foreach(function ( stream, file ) {
            var name = path.basename(file.path);
            var filePath = coreLibraryFolder + name;
            var srcJson = JSON.parse(file.contents.toString());
            var selectedFromKambi = {};
            fs.stat(filePath, function ( err ) {
               if ( err == null ) {
                  var localeJson = json_merger.fromFile(filePath);

                  if ( buildParameters.localeStrings && buildParameters.localeStrings.length ) {
                     buildParameters.localeStrings.forEach(function ( localeString ) {
                        var key = Object.keys(localeString),
                           path = localeString[key];
                        /* Ignoring the error, not the best practice */
                        /* jslint evil: true */
                        selectedFromKambi[key[0]] = new Function('_', 'return _.' + path)(localeJson);
                     });
                  }

                  var result = extendObj(srcJson, selectedFromKambi);
                  gulpFile(name, JSON.stringify(result, null, 3), { src: true })
                     .pipe(gulp.dest('./src/i18n/'));
               }
            });
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
