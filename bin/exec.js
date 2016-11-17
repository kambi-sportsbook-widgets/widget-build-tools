const childProcess = require('child_process');

/**
 * Executes given command. Prints results to stdout/stderr.
 * @param {string} cmd Command to be executed
 * @param {object} [options] Options object
 * @returns {Promise}
 */
const exec = (cmd, options) => {
   return new Promise((resolve, reject) => {
      console.log(`> ${cmd}`);

      childProcess.exec(cmd, options, (error, stdout, stderr) => {
         if (error) {
            reject(error);
            return;
         }

         process.stdout.write(stdout);
         process.stderr.write(stderr);

         resolve(stdout);
      });
   });
};

module.exports = exec;
