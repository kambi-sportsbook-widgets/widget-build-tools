(function () {
   'use strict';
   var gulp = require('gulp'),

   awspublish = require('gulp-awspublish'),

   rename = require('gulp-rename'),

   concat = require('gulp-concat'),

   uglify = require('gulp-uglify'),

   color = require('cli-color'),

   rename = require('gulp-rename'),

   notify = require('gulp-notify'),

   jshint = require('gulp-jshint'),

   stripDebug = require('gulp-strip-debug'),

   sourcemaps = require('gulp-sourcemaps'),

   sass = require('gulp-ruby-sass'),

   cssnano = require('gulp-cssnano'),

   htmlReplace = require('gulp-html-replace'),

   del = require('del'),

   replace = require('gulp-replace'),

   path = require('path'),

   gulpFile = require('gulp-file'),

   foreach = require('gulp-foreach'),

   json_merger = require('json_merger'),

   buildTemp = '.buildTemp',

   compiledTemp = '.compiledTemp',

   npmLibs = [
      './node_modules/kambi-sportsbook-widget-library/dist/js/app.min.js',
      './node_modules/kambi-sportsbook-widget-core-translate/dist/translate.js'
   ];



   var logEntry= function(err, key) {
      console.error(color.bold(key), err[key.trim()]);
   };
   //Auxiliar function that logs errors, showing the filename, stacktrace and such
   var logError = function(err) {
      console.error('');
      console.error(color.red(err.message));
      logEntry(err, 'type         ');
      logEntry(err, 'fileName     ');
      console.error(color.bold('location'), err.line + ':' + err.column);
      logEntry(err, 'plugin       ');
      logEntry(err, 'stacktrace   ');
   };

   gulp.task('default', ['clean-build'], function () { });

   gulp.task('publish', function () {
      var publisher = awspublish.create({
         params: {
            Bucket: 'kambi-widgets'
         }
      });

      var headers = {};

      return gulp.src(['./dist/**/*'])
         .pipe(rename(function ( path ) {
            path.dirname = '/tournament/' + path.dirname;
         }))
         .pipe(publisher.publish(headers, {
            //force: true
         }))
         .pipe(publisher.cache())
         .pipe(awspublish.reporter());
   });

   //compiles all scss files and places them in compiledTemp folder
   gulp.task('scss', [], function () {
      return sass('./src/scss/app.scss', {
            compass: true,
            style: 'expanded',
            lineComments: false,
            sourcemap: true
         })
         .on('error', logError)
         .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot: './src'
         }))
         .pipe(gulp.dest('./'+ compiledTemp +'/css'));
   });

   //compiles all js files using Babel and places them in compiledTemp folder
   gulp.task('babel', [], function() {
      return gulp.src('./src/**/*.js')
         .pipe(gulp.dest('./'+ compiledTemp +'/js'));
   });

   //copies all static files (.html, .json, images) to compiledTemp folder, i18n files are handled
   //by the translations task
   gulp.task('compile-static', [], function() {
      return gulp
         .src(['./src/**/*', '!./src/**/*.js', '!./src/**/*.scss', '!./src/i18n/**'])
         .pipe(gulp.dest('./'+ compiledTemp +'/js'));
   });

   //merges the i18n files from .src/i18n/ with kambi-sportsbook-widget-core-translate i18n files
   //and places them into compiledTemp/i18n/
   gulp.task('translations', function () {
      return gulp.src('./src/i18n/*.json')
         .pipe(foreach(function ( stream, file ) {
            var name = path.basename(file.path);
            var filePath = file.cwd+'/node_modules/kambi-sportsbook-widget-core-translate/dist/i18n/' + name;
            var srcJson = JSON.parse(file.contents.toString());
            var coreJson = json_merger.fromFile(filePath);
            var result = extendObj(srcJson, coreJson);
            gulpFile(name, JSON.stringify(result), { src: true })
               .pipe(gulp.dest(compiledTemp + '/i18n'));
            return stream;
         }));
   });

   //compiles all js, scss and i18n files and place them (alongside static files) in the dist folder
   gulp.task('compile', ['babel', 'scss', 'compile-static', 'translations']);

   //watches for any change in the files inside /src/ folder and recompiles them
   gulp.task('watch', [], function() {
      gulp.watch('src/**/*.js', ['babel']);
      gulp.watch('src/**/*.scss', ['scss']);
      gulp.watch('src/i18n/*.json', ['translations']);
      gulp.watch(['./src/**/*', '!./src/**/*.js', '!./src/**/*.scss', '!./src/i18n/**'], ['compile-static']);
   });

   //minifies and concatenates all css files and places them in the dist folder
   gulp.task('css', ['scss'], function () {
      return gulp.src('./'+ compiledTemp +'/css/**/*.css')
         .pipe(concat('app.css'))
         .pipe(gulp.dest('./dist/css'))
         .pipe(cssnano())
         .pipe(rename('app.min.css'))
         .pipe(gulp.dest('./dist/css'));
   });

   //cleans the project (deletes compiledTemp, /dist/ and buildTemp folders)
   gulp.task('clean', function () {
      del.sync(compiledTemp);
      del.sync('.dist');
      return del.sync(buildTemp);
   });

   gulp.task('clean-build', ['clean'], function () {
      return gulp.start('build');
   });

   gulp.task('build', ['js-concat', 'compile', 'translations'], function () {
      return gulp.src('./' + compiledTemp + '/src/index.html')
         .pipe(htmlReplace({
            css: 'css/app.min.css',
            js: 'js/app.min.js'
         }))
         .pipe(gulp.dest('./dist'));
   });

   gulp.task('app-concat', function () {
      return gulp.src('./src/**/*.js')
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('default'))
         .pipe(stripDebug())
         .pipe(concat('app.js'))
         .pipe(gulp.dest('./' + buildTemp + '/js'));
   });

   gulp.task('npm-build', function () {
      return gulp.src(npmLibs)
         .pipe(concat('libs.js'))
         .pipe(gulp.dest('./' + buildTemp + '/js'));
   });

   gulp.task('js-concat', ['app-concat', 'npm-build'], function () {
      return gulp.src('./' + buildTemp + '/**/*.js')
         .pipe(concat('app.js'))
         .pipe(gulp.dest('./dist/js'))
         .pipe(uglify())
         .pipe(rename('app.min.js'))
         .pipe(gulp.dest('./dist/js'));
   });

   function extendObj(obj, src) {
      Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
      return obj;
   }


}).call(this);
