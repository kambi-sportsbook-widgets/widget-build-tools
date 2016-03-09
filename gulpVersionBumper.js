/**
 * Gulp tasks used for bumping version of the project. One different task for each type of version
 * bump (prerelease, patch, minor and major).
 * The process consist in:
 * bumping the version in package.json
 * git soft reset (clears staged changes)
 * git commit
 * git tag (tag name is 'vX.Y.Z-W')
 * git push (also pushes the tag)
 */

(function () {
   'use strict';

   var gulp = require('gulp'),

   fs = require('fs'),

   bump = require('gulp-bump'),

   git = require('gulp-git');

   var handleErr = function (err) {
      if (err) {
         throw err;
      }
   };

   gulp.task('version-bump-git-reset', function (gulpCallback) {
      git.reset('HEAD', {}, function (err) {
         handleErr(err);
         gulpCallback();
      });
   });

   gulp.task('version-bump-git-commit', ['version-bump-git-reset'], function () {
      var version = null;
      try {
         version = JSON.parse(fs.readFileSync('./package.json')).version;
      } catch (err2) {
         handleErr(err2);
      }
      return gulp.src('./package.json')
         .pipe(git.add())
         .pipe(git.commit('bumped version to: v' + version));
   });

   gulp.task('version-bump-git-tag', ['version-bump-git-commit'], function (gulpCallback) {
      var version = null;
      try {
         version = JSON.parse(fs.readFileSync('./package.json')).version;
      } catch (err2) {
         handleErr(err2);
      }
      git.tag('v' + version, 'v' + version, {}, function (err) {
         handleErr(err);
         gulpCallback();
      });
   });

   gulp.task('version-bump-git-push', ['version-bump-git-tag'], function (gulpCallback) {
      git.push('origin', 'master', { args: '--follow-tags' }, function (err) {
         handleErr(err);
         gulpCallback();
      });
   });

   var bumpVersion = function (type) {
      return gulp.src('./package.json')
         .pipe(bump({ type: type }))
         .pipe(gulp.dest('./'));
   };

   gulp.task('version-bump-minor2', function () {
      return bumpVersion('minor');
   });
   gulp.task('version-bump-minor', ['version-bump-minor2'], function () {
      return gulp.start('version-bump-git-push');
   });

   gulp.task('version-bump-major2', function () {
      return bumpVersion('major');
   });
   gulp.task('version-bump-major', ['version-bump-major2'], function () {
      return gulp.start('version-bump-git-push');
   });

   gulp.task('version-bump-patch2', function () {
      return bumpVersion('patch');
   });
   gulp.task('version-bump-patch', ['version-bump-patch2'], function () {
      return gulp.start('version-bump-git-push');
   });

   gulp.task('version-bump-prerelease2', function () {
      return bumpVersion('prerelease');
   });
   gulp.task('version-bump-prerelease', ['version-bump-prerelease2'], function () {
      return gulp.start('version-bump-git-push');
   });

}).call(this);
