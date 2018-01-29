const childProcess = require('child_process')

/**
 * Executes given command. Prints results to stdout/stderr.
 * @param {string} cmd Command to be executed
 * @param {string[]} params Command parameters array
 * @param {object} [options] Options object
 * @param {boolean} [inheritStdio=true] if true the main process stdin, stdout and stderr will be used for the child process. If false the returned promise will be resolved with stdout or reject with stderr. If false stdin is not passed to the child process
 * @returns {Promise}
 */
const exec = (cmd, params, options, inheritStdio) => {
  options = options == null ? {} : options
  inheritStdio = inheritStdio == null ? true : inheritStdio
  return new Promise((resolve, reject) => {
    console.log(`> ${cmd} ${params.join(' ')}`)

    if (inheritStdio === true) {
      options.stdio = 'inherit'
    }
    const child = childProcess.spawn(cmd, params, options)

    let stdout = ''
    let stderr = ''
    if (inheritStdio === false) {
      child.stdout.on('data', data => (stdout += data))
      child.stderr.on('data', data => (stderr += data))
    }

    child.on('close', code => {
      if (code == 0) {
        if (inheritStdio === true) {
          resolve()
        } else {
          resolve(stdout)
        }
      } else {
        if (inheritStdio === true) {
          reject(new Error(`Process exited with code ${code}\n`))
        } else {
          reject(stderr)
        }
      }
    })
  })
}

module.exports = exec
