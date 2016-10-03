#!/usr/bin/env node

const childProcess = require('child_process'),
   getopt = require('node-getopt'),
   opn = require('opn'),
   path = require('path'),
   packageJson = require(path.join(process.cwd(), 'package.json'));

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
   console.log('preversion\t\t\tRuns NPM\'s preversion hook');
   console.log('');
   console.log('postversion\t\t\tRuns NPM\'s postversion hook');
   console.log('\t--without-changelog\tDoesn\'t open browser with changelog');
   console.log('');
};

// *** ACTIONS ***

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
      });
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
   case 'preversion':
      action(preversion);
      break;

   case 'postversion':
      var opt = getopt.create([['', 'without-changelog']])
         .parseSystem();

      action(postversion, opt.options['without-changelog']);
      break;

   default:
      console.error(`Invalid command: ${process.argv[1]}`);
      help();
      process.exit(1);
}
