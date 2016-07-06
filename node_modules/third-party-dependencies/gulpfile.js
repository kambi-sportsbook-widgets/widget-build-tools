'use strict';

var gulp = require('gulp'),

   concat = require('gulp-concat'),

   del = require('del'),

   rename = require('gulp-rename'),

   uglify = require('gulp-uglify');

   require('./gulpVersionBumper.js');

gulp.task('clean', function() {
   return del.sync('dist');
});

gulp.task('default', ['clean'], function () {
   return gulp.start('build');
});

gulp.task('build', function () {
   return gulp.src([
         './src/js/stapes.js',
         './src/js/es6-promise.js', // must be loaded before fetch
         './src/js/fetch.js',
         './src/js/sightglass.js', // must be loaded before rivets
         './src/js/rivets.js'
      ])
      .pipe(concat('thirdparty.js'))
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('thirdparty.min.js'))
      .pipe(gulp.dest('dist'));
});
