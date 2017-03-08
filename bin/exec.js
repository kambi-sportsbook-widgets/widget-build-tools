const childProcess = require('child_process');

/**
 * Executes given command. Prints results to stdout/stderr.
 * @param {string} cmd Command to be executed
 * @param {string[]} params Command parameters array
 * @param {object} [options] Options object
 * @returns {Promise}
 */
const exec = (cmd, params, options) => {
   options = options == null ? {} : options;
   return new Promise((resolve, reject) => {
      console.log(`> ${cmd} ${params.join(' ')}`);

      options.stdio = 'inherit';
      const child = childProcess.spawn(cmd, params, options);

      child.on('close', (code) => {
         if (code == 0) {
            resolve();
         } else {
            reject(new Error(`Process exited with code ${code}\n`));
         }
      });
   });
};

module.exports = exec;
