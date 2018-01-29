#!/usr/bin/env node

const getopt = require('node-getopt')

// construct actions array
const actions = require('./init')
  .concat(require('./init-react'))
  .concat(require('./build'))
  .concat(require('./version'))
  .concat(require('./test'))

/**
 * Displays help message.
 */
const help = () => {
  const pad = str => {
    for (let i = str.length - 1; i < 35; i++) {
      str += ' '
    }

    return str
  }

  console.log('Usage: kambi-widgets-cli <action> [options...]')
  console.log('')
  console.log('Actions:')
  console.log('')

  actions.forEach(action => {
    const actionName = action.config.usage || action.config.name

    console.log(`${pad(actionName)}${action.config.description}`)

    if (action.config.options) {
      action.config.options.forEach(option => {
        console.log(`${pad('   --' + option[1])}${option[2]}`)
      })
    }

    console.log('')
  })
}

// *** MAIN ***

// check if we've been called for help
if (process.argv.indexOf('-h') > -1 || process.argv.indexOf('--help') > -1) {
  help()
  process.exit(0)
}

// check if action argument is present
if (process.argv.length < 3) {
  console.error('Error: Missing action argument')
  process.exit(1)
}

// find given action function
const action = actions.find(action => action.config.name == process.argv[2])

// check if given action exists
if (!action) {
  console.error(`Error: Action '${process.argv[2]}' not found`)
  process.exit(1)
}

let parsedOptions
if (action.name === 'test') {
  // we pass the options for tests directly to jest
  parsedOptions = {
    options: {
      jestopts: process.argv.slice(3).join(' '),
    },
  }
} else {
  // set up options parser
  parsedOptions = getopt.create(action.config.options || []).parseSystem()
}

// run action
action(parsedOptions).then(
  () => process.exit(0),
  error => {
    process.stderr.write(`Error: ${error.message}`)
    process.exit(1)
  }
)
