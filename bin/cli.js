#!/usr/bin/env node

const childProcess = require('child_process'),
   getopt = require('node-getopt'),
   opn = require('opn'),
   path = require('path'),
   packageJson = require(path.join(process.cwd(), 'package.json')), // eslint-disable-line
   webpack = require('webpack'),
   WebpackDevServer = require('webpack-dev-server'),
   fs = require('fs'),
   chalk = require('chalk');

/**
 * Executes given command. Prints results to stdout/stderr.
 * @param {string} cmd Command to be executed
 * @returns {Promise}
 */
const exec = function(cmd) {
   return new Promise((resolve, reject) => {
      console.log(`> ${cmd}`);

      childProcess.exec(cmd, {}, (error, stdout, stderr) => {
         if (error) {
            reject(error);
            return;
         }

         process.stdout.write(stdout);
         process.stderr.write(stderr);

         resolve();
      });
   });
};

/**
 * Extracts repository URL from package.json.
 * @returns {string}
 */
const repositoryURL = function() {
   if (!packageJson.hasOwnProperty('repository')) {
      throw new Error('Missing \'repository\' field in package.json');
   }

   if (packageJson.repository.isPrototypeOf(String)) {
      return packageJson.repository;
   }

   if (!packageJson.repository.hasOwnProperty('url')) {
      throw new Error('Missing \'repository.url\' field in package.json');
   }

   return packageJson.repository.url;
};

/**
 * Runs given action and handles errors.
 * @param {function} func Pointer to action's function
 * @param {object...} args Action arguments
 */
const action = function(func, ...args) {
   func.apply(undefined, args)
      .then(
         () => process.exit(0),
         (error) => {
            console.error(error);
            process.exit(1);
         }
      );
};

/**
 * Displays help message.
 */
const help = function() {
   console.log('Usage: build-tools <action> [options...]');
   console.log('');
   console.log('Actions:');
   console.log('');
   console.log('build\t\t\tBuilds widget for given environment');
   console.log('\t-d|--dev\tStarts a development server (default)');
   console.log('\t-p|--prod\tBuild production distribution');
   console.log('');
   console.log('preversion\t\t\tRuns NPM\'s preversion hook');
   console.log('');
   console.log('postversion\t\t\tRuns NPM\'s postversion hook');
   console.log('\t--without-changelog\tDoesn\'t open browser with changelog');
   console.log('');
};

/**
 * Returns a webpack instance configured by webpack.config.js
 * @param resolve function to call on success
 * @param reject function to call on error
 */
const createWebpack = function() {
   return webpack(require('../webpack.config.js')); // eslint-disable-line
};


// *** ACTIONS ***

/**
 * Starts a development server for widget.
 * @returns {Promise}
 */
const buildDev = function() {
   console.log(chalk.cyan('Starting the development server...'));

   process.env.NODE_ENV = 'development';
   const devServer = new WebpackDevServer(createWebpack(), {
      hot: true,
      debug: true,
      'output-pathinfo': true,
      inline: true,
      watch: true,
      watchOptions: {
         ignored: /node_modules/
      },
      https: true,
   });

   devServer.use(devServer.middleware);

   // Launch WebpackDevServer
   const port = 8080;
   return new Promise(function (resolve, reject) {
      devServer.listen(port, (err, result) => {
         if (err) {
            reject(err);
            return;
         }

         console.log('The app is running at:');
         console.log('  ' + chalk.cyan('https://localhost:' + port + '/'));
         console.log('');

         // resolve(); if we resolve the server closes
      });
   });
};

/**
 * Builds a distributable package of widget.
 * @returns {Promise}
 */
const buildProd = function() {
   process.env.NODE_ENV = 'production';
   return new Promise(function(resolve, reject) {
      const compiler = createWebpack();
      compiler.run(function(err, stats) {
         if (err) {
            console.error(err);
            reject();
            return;
         }
         var jsonStats = stats.toJson();
         if (jsonStats.errors.length > 0) {
            jsonStats.errors.forEach(function(err) {
               console.error(err);
            });
         }
         if (jsonStats.warnings.length > 0) {
            jsonStats.warnings.forEach(function(warn) {
               console.warn(warn);
            });
         }
         resolve(compiler);
      });
   });
};

/**
 * NPM's preversion hook
 * @returns {Promise}
 */
const preversion = function() {
   return exec('git reset HEAD');
};

/**
 * NPM's postversion hook
 * @returns {Promise}
 */
const postversion = function(withoutChangelog) {
   return exec('git push --follow-tags')
      .then(() => {
         if (withoutChangelog) {
            return;
         }

         try {
            const changelogURL = repositoryURL()
               .replace(/^(git\+https?|git\+ssh):\/\/(.*@)?(.+?)(\.git\/?)?$/, 'https://$3')
               .concat(`/releases/tag/v${packageJson.version}`);

            // GitHub needs some time to publish our commit
            console.log('Waiting for GitHub...');

            return new Promise((resolve) => {
               setTimeout(() => {
                  opn(changelogURL);
                  resolve();
               }, 2000);
            });
         } catch (e) { return; }
      });
};

/**
 * Deletes a folder recursevely
 * @param path {String} the path to delete
 * @returns {Promise}
 */
const cleanDist = function() {
   const deleteFolderRecursive = function(path) {
      if (fs.existsSync(path)) {
         fs.readdirSync(path).forEach(function(file, index) {
            const curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
               deleteFolderRecursive(curPath);
            } else { // delete file
               fs.unlinkSync(curPath);
            }
         });
         fs.rmdirSync(path);
      }
   }
   deleteFolderRecursive('dist');
   return Promise.resolve();
};
// *** MAIN ***

// check arguments
if (process.argv.length < 3) {
   help();
   process.exit(1);
}

// display help
if (process.argv.indexOf('-h') > -1 || process.argv.indexOf('--help') > -1) {
   help();
   process.exit(0);
}

// dispatch action
switch (process.argv[2]) {
   case 'clean': {

      action(cleanDist);

      break;
   }
   case 'build': {
      const opt = getopt.create([
         ['d', 'dev'],
         ['p', 'prod']
      ]).parseSystem();

      if (opt.options['prod']) {
         action(buildProd);
      } else {
         action(buildDev);
      }

      break;
   }

   case 'preversion': {
      action(preversion);
      break;
   }

   case 'postversion': {
      const opt = getopt.create([['', 'without-changelog']])
         .parseSystem();

      action(postversion, opt.options['without-changelog']);

      break;
   }

   default: {
      console.error(`Invalid command: ${process.argv[1]}`);
      help();
      process.exit(1);
   }
}
