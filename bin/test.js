const chalk = require('chalk'),
   exec = require('./exec'),
   path = require('path');

/**
 * Deletes distribution folder recursively
 * @returns {Promise}
 */
const test = ({ options }) => {
   const buildToolsPath = path.resolve(__dirname, '../');
   const subjectPath = process.cwd();
   const config = {
      /*
      this object is serialized into a CLI command
      that is why we have to use so many backslashes in the regular expressions
      */
      moduleDirectories: [
         'node_modules',
         path.resolve(buildToolsPath, 'node_modules')
      ],
      moduleNameMapper: {
         [ '\\.(s?css|less)$' ]: "identity-obj-proxy"
      },
      rootDir: subjectPath,
      testRegex: '(./tests/.*|(\\.|/)(test|spec))\\.jsx?$',

      transform: {
         ['\\.jsx?']: 'babel-jest'
      },
      transformIgnorePatterns: [
         '/node_modules/(?!kambi-widget-core-library)(?!kambi-widget-components)' // transforms core-library and widget-components as well but ignores the rest of /node_modules/
      ]
   };

   const jestParams = ['--colors'];
   const nodeParams = [];

   if (options.updateSnapshot) {
      jestParams.push('-u');
   }

   if (options.verbose) {
      jestParams.push('--verbose');
   }

   if (options.coverage) {
      jestParams.push('--coverage');
      config.coverageDirectory = path.resolve(subjectPath, 'coverage');
   }

   if (options.watch) {
      jestParams.push('--watch');
   }

   if (options.debug) {
      // Breakpoints are currently not working (tested on nodejs 7.6)
      // see https://github.com/facebook/jest/issues/1652
      jestParams.push('--runInBand'); // makes the tests run serially instead of in parallel
      nodeParams.push('--inspect');
      nodeParams.push('--debug-brk');
   }

   jestParams.push(`--config=${JSON.stringify(config)}`);

   return exec('node',
      nodeParams
         .concat(['./node_modules/.bin/jest'])
         .concat(jestParams),
      { cwd: subjectPath }
   );
};

test.config = {
   name: 'test',
   description: 'Runs test suite',
   options: [
      ['', 'coverage', 'Indicates that test coverage information should be collected and reported in the output.'],
      ['u', 'updateSnapshot', 'Use this flag to re-record snapshots.'],
      ['', 'verbose', 'Display individual test results with the test suite hierarchy'],
      ['w', 'watch', 'Watchs for changes to files and re-run the tests'],
      ['d', 'debug', 'Runs the tests in debug mode. Requires Nodejs version 6.3 or higher. It is better to run this in conjuction with the watch mode. As of Nodejs version 7.6 breakpoints and debugger statements are ignored. This is a bug in Nodejs']
   ]
};

module.exports = [ test ];
