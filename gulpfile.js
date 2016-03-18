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

      buildTemp = '.buildTemp',

      compiledTemp = '.compiledTemp';

   var buildParameters = JSON.parse(fs.readFileSync('./buildparameters.json'));

   var coreLibConfig = JSON.parse(fs.readFileSync('./node_modules/kambi-sportsbook-widget-library/package.json'));

   var kambiAPIVersion = coreLibConfig['kambi-widget-api-version'] != null ? coreLibConfig['kambi-widget-api-version'] : '1.0.0.8';

   var kambiWidgetAPIUrl = 'https://c3-static.kambi.com/sb-mobileclient/widget-api/{{API_VERSION}}/kambi-widget-api.js'
      .replace('{{API_VERSION}}', kambiAPIVersion);

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
            './node_modules/widget-build-tools/widget_config/config.rb'
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
    * Merges the i18n files from ./src/i18n/ with kambi-sportsbook-widget-core-translate i18n files
    */
   gulp.task('compile-translations', function () {
      return gulp.src('./src/i18n/*.json')
         .pipe(foreach(function ( stream, file ) {
            var name = path.basename(file.path);
            var filePath = file.cwd + '/node_modules/kambi-sportsbook-widget-core-translate/dist/i18n/' + name;
            var srcJson = JSON.parse(file.contents.toString());
            var coreJson = json_merger.fromFile(filePath);
            var result = extendObj(srcJson, coreJson);
            gulpFile(name, JSON.stringify(result), { src: true })
               .pipe(gulp.dest(compiledTemp + '/i18n'))
               .pipe(jsonminify())
               .pipe(gulp.dest('./dist/i18n/'));
            return stream;
         }));
   });

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

   function extendObj ( obj, src ) {
      Object.keys(src).forEach(function ( key ) {
         obj[key] = src[key];
      });
      return obj;
   }

}).call(this);
