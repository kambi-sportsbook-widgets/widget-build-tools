const chalk = require('chalk'),
  exec = require('./exec'),
  path = require('path')

process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'
/**
 * Deletes distribution folder recursively
 * @returns {Promise}
 */
const test = ({ options }) => {
  const buildToolsPath = path.resolve(__dirname, '../')
  const subjectPath = process.cwd()
  const config = {
    /*
      this object is serialized into a CLI command
      that is why we have to use so many backslashes in the regular expressions
      */
    moduleDirectories: [
      'node_modules',
      path.resolve(buildToolsPath, 'node_modules'),
    ],
    moduleNameMapper: {
      ['\\.(s?css|less|jpe?g|png)$']: 'identity-obj-proxy',
    },
    rootDir: subjectPath,
    testRegex: '(./tests/.*|(\\.|/)(test|spec))\\.jsx?$',
    transform: {
      ['\\.jsx?']: path.resolve(buildToolsPath, './jest/transform.js'),
    },
    transformIgnorePatterns: [
      '/node_modules/(?!kambi-widget-core-library)(?!kambi-widget-components)', // transforms core-library and widget-components as well but ignores the rest of /node_modules/
    ],
  }

  const nodeParams = []
  const jestParams = options.jestopts.split(' ')

  const debug = jestParams.indexOf('--debug') !== -1

  if (debug) {
    // Breakpoints are currently not working (tested on nodejs 7.6)
    // see https://github.com/facebook/jest/issues/1652
    jestParams.push('--runInBand') // makes the tests run serially instead of in parallel
    nodeParams.push('--inspect')
    nodeParams.push('--debug-brk')
    jestParams.splice(jestParams.indexOf('--debug'), 1)
  }

  jestParams.push('--colors')
  jestParams.push(`--config=${JSON.stringify(config)}`)

  // opts =  [ 'run', 'jest', '--', '--colors', '--watch' ]
  // opts.push(`--config=${JSON.stringify(config)}`)
  // return exec('npm',)

  return exec(
    'node',
    nodeParams.concat(['./node_modules/.bin/jest']).concat(jestParams),
    { cwd: subjectPath }
  )
}

test.config = {
  name: 'test',
  description:
    'Runs test suite. All options except --debug are passed to directly to jest. Jest options can be found here: https://facebook.github.io/jest/docs/cli.html',
  options: [
    [
      '',
      'debug',
      'Runs the tests in debug mode. Requires Nodejs version 6.3 or higher. It is better to run this in conjuction with the watch mode. As of Nodejs version 7.6 breakpoints and debugger statements are ignored. This is a bug in Nodejs',
    ],
  ],
}

module.exports = [test]
