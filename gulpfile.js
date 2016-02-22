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

   install = require('gulp-install'),

   path = require('path'),

   gulpFile = require('gulp-file'),

   foreach = require('gulp-foreach'),

   json_merger = require('json_merger'),

   merge_stream = require('merge-stream'),

   run_sequence = require('run-sequence'),

   babel = require('gulp-babel'),

   buildTemp = '.buildTemp',

   compiledTemp = '.compiledTemp',

   npmLibs = [
      './node_modules/kambi-sportsbook-widget-library/dist/js/app.min.js',
      './node_modules/kambi-sportsbook-widget-core-translate/dist/translate.js'
   ];

   /**
    * Copies project configuration files from the build tools into the project
    * The files are: .gitignore, .jshintrc, .editorconfig, config.rb
    */
   gulp.task('copy-config-files', function() {
      return gulp.src([
            './node_modules/widget-build-tools/widget_config/.gitignore',
            './node_modules/widget-build-tools/widget_config/.editorconfig',
            './node_modules/widget-build-tools/widget_config/.jshintrc',
            './node_modules/widget-build-tools/widget_config/config.rb',
         ])
         .pipe(gulp.dest('./'));
   });

   /**
    * cleans the project (deletes compiledTemp, /dist/ and buildTemp folders)
    */
   gulp.task('clean', function () {
      del.sync(compiledTemp);
      del.sync('.dist');
      return del.sync(buildTemp);
   });

   /**
    * cleans then builds
    */
   gulp.task('default', ['clean'], function () {
      return gulp.start('build');
   });

   /**
    * tasks used by 'build' to run everything in the right order
    */
   gulp.task('build2', ['copy-config-files'], function() {
      gulp.start('build3');
   });
   gulp.task('build3', ['compile'], function() {
      gulp.start('build4');
   });
   gulp.task('build4', ['css-concat', 'js-concat']);

   /**
    * full build cycle with compilling and minifying, then replaces references
    * inside index.html to reference the minified and concatanated js and css files
    */
   gulp.task('build', ['build2'], function() {
      return gulp.src('./' + compiledTemp + '/src/index.html')
         .pipe(htmlReplace({
            css: 'css/app.min.css',
            js: 'js/app.min.js'
         }))
         .pipe(gulp.dest('./dist'));
   });

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

   /**
    * compiles all scss files and places them in {compiledTemp}/css/ folder
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
         .pipe(gulp.dest('./'+ compiledTemp +'/css'));

      var sourceStream = gulp.src('./src/**/*.scss')
         .pipe(gulp.dest('./'+ compiledTemp +'/css/src/'));

      return merge_stream(scssStream, sourceStream);
   });

   /**
    * compiles all js files using Babel and places them in {compiledTemp} folder
    */
   gulp.task('compile-babel', [], function() {
      // TODO add babel compilation step once chrome sourcemap bug gets fixed
      // https://bugs.chromium.org/p/chromium/issues/detail?id=369797
      // var babelStream = gulp.src('./src/**/*.js')
      //    .pipe(jshint('.jshintrc'))
      //    .pipe(jshint.reporter('default'))
      //    .pipe(stripDebug())
      //    .pipe(sourcemaps.init())
      //    .pipe(babel({
      //       presets: ['es2015'],
      //       sourceRoot: '../src/'
      //    }))
      //    .pipe(concat('app.js'))
      //    .pipe(sourcemaps.write('.'))
      //    .pipe(gulp.dest('./'+ compiledTemp +'/js/'));
      //
      // var sourceStream = gulp.src('./src/**/*.js')
      //    .pipe(gulp.dest('./'+ compiledTemp +'/js/src/'));
      //
      // return merge_stream(babelStream, sourceStream);

      return gulp.src('./src/**/*.js')
         .pipe(jshint('.jshintrc'))
         .pipe(jshint.reporter('default'))
         .pipe(stripDebug())
         .pipe(gulp.dest('./'+ compiledTemp));
   });

   /**
    * copies all static files (.html, .json, images) to compiledTemp folder, i18n files are handled
    * by the translations task
    */
   gulp.task('compile-static', [], function() {
      return gulp
         .src([
            './src/**/*',
            '!./src/js/**',
            '!./src/js/',
            '!./src/scss/**',
            '!./src/scss/',
            '!./src/i18n/**',
            '!./src/i18n/',
         ])
         .pipe(gulp.dest('./'+ compiledTemp));
   });

   /**
    * merges the i18n files from ./src/i18n/ with kambi-sportsbook-widget-core-translate i18n files
    */
   gulp.task('compile-translations', function () {
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

   /**
    * compiles all js, scss and i18n files and place them (alongside static files) in the dist
    * folder
    */
   gulp.task('compile', ['compile-babel', 'compile-scss', 'compile-static', 'compile-translations']);

   /**
    * watches for any change in the files inside /src/ folder and recompiles them
    */
   gulp.task('watch', [], function() {
      gulp.watch('src/**/*.js', ['compile-babel']);
      gulp.watch('src/**/*.scss', ['compile-scss']);
      gulp.watch('src/i18n/*.json', ['compile-translations']);
      gulp.watch(['./src/**/*', '!./src/**/*.js', '!./src/**/*.scss', '!./src/i18n/**'], ['compile-static']);
   });

   /**
    * minifies and concatenates all css files from {compiledTemp} and places them in the dist folder
    */
   gulp.task('css-concat', function () {
      return gulp.src('./'+ compiledTemp +'/css/**/*.css')
         .pipe(concat('app.css'))
         .pipe(gulp.dest('./dist/css'))
         .pipe(cssnano())
         .pipe(rename('app.min.css'))
         .pipe(gulp.dest('./dist/css'));
   });

   /**
    * creates a lib.js {buildTemp}/src folder that concatenates the npmLibs specified
    */
   gulp.task('npm-build', function () {
      return gulp.src(npmLibs)
         .pipe(concat('libs.js'))
         .pipe(gulp.dest('./' + buildTemp + '/js'));
   });

   /**
    * concatanates all the js files in the compiledTemp folder into {buildTemp}/app.js
    */
   gulp.task('app-concat', function () {
      return gulp.src('./'+ compiledTemp +'/**/*.js')
         .pipe(concat('app.js'))
         .pipe(gulp.dest('./' + buildTemp + '/js'));
   });

   /**
    * concatanates and minifies all js files in {buildTemp} into /dist/js/app.min,js
    */
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
