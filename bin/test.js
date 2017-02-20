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
   const cliPath = 'npm';

   const config = {
      moduleDirectories: [
         'node_modules',
         path.resolve(buildToolsPath, 'node_modules')
      ],
      moduleNameMapper: {
         [ '\\\\.(s?css|less)$' ]: "identity-obj-proxy"
      },
      rootDir: subjectPath,
      testRegex: '(/tests/.*|(\\\\.|/)(test|spec))\\\\.jsx?$',
      transform: {
         ['\\\\.jsx?']: path.resolve(buildToolsPath, './jest/transform.js')
      },
      transformIgnorePatterns: [
         '/node_modules/(?!kambi-widget-core-library)(?!kambi-widget-components)'
      ]
   };

   const params = [ 'run', 'jest', '--', '--colors' ];

   if (options.updateSnapshot) {
      params.push('-u');
   }

   if (options.verbose) {
      params.push('--verbose');
   }

   if (options.coverage) {
      params.push('--coverage');
      config.coverageDirectory = path.resolve(subjectPath, 'coverage');
   }

   params.push(`--config=${JSON.stringify(config)}`);

   return exec(cliPath, params, { cwd: buildToolsPath });
};

test.config = {
   name: 'test',
   description: 'Runs test suite',
   options: [
      ['', 'coverage', 'Indicates that test coverage information should be collected and reported in the output.'],
      ['u', 'updateSnapshot', 'Use this flag to re-record snapshots.'],
      ['', 'verbose', 'Display individual test results with the test suite hierarchy']
   ]
};

module.exports = [ test ];
