const chalk = require('chalk'),
   fs = require('fs-extra-promise'),
   path = require('path'),
   webpack = require('webpack'),
   WebpackDevServer = require('webpack-dev-server');

/**
 * Copies config files to the widget folder
 * This method is synchronous
 * @returns {Promise}
 */
const copyConfigFiles = () => {
   const fileNames = [
      '.editorconfig',
      '.eslintrc',
      'LICENSE',
      'gitignore',
      'mockSetupData.json'
   ];
   const configFolder = path.join(process.cwd(), 'node_modules/widget-build-tools/widget_config/');
   const paths = fileNames.map((p) => {
      return path.join(configFolder, p);
   });
   for (let i = 0; i < 3; i++) {
      if (fs.existsSync(paths[i])) {
         fs.copySync(paths[i], path.join(process.cwd(), fileNames[i]));
      }
   }

   // files with special handling

   // LICENSE file, we don't copy it if it is already there
   if (fs.existsSync(paths[3])) {
      const dest = path.join(process.cwd(), fileNames[3]);
      if (!fs.existsSync(dest)) {
         fs.copySync(paths[3], dest);
      }
   }

   // gitignore, we need to rename it to .gitignore (npm strips .gitignore)
   if (fs.existsSync(paths[4])) {
      const dest = path.join(process.cwd(), '.' + fileNames[4]);
      fs.copySync(paths[4], dest);
   }

   // mockSetupData.json, we need to copy it to /src/ and only if it doesn't exist
   if (fs.existsSync(paths[5])) {
      const dest = path.join(process.cwd(), '/src/' + fileNames[5]);
      if (!fs.existsSync(dest)) {
         fs.copySync(paths[5], dest);
      }
   }

   return Promise.resolve();
};

/**
 * Deletes distribution folder recursively
 * @returns {Promise}
 */
const clean = () => {
   return copyConfigFiles()
      .then(() => fs.removeAsync(path.join(process.cwd(), 'dist')));
};

clean.config = {
   name: 'clean',
   description: 'Removes build files'
};

/**
 * Starts a development server for widget.
 * @returns {Promise}
 */
const start = (opt) => {
   process.env.NODE_ENV = 'development';
   console.log(chalk.cyan('Starting the development server...'));

   const port = opt.options.port || 8080;

   return copyConfigFiles()
      .then(() => {
         const compiler = webpack(require('../webpack.config.js')); // eslint-disable-line
         const devServer = new WebpackDevServer(compiler, {
            hot: true,
            debug: true,
            'output-pathinfo': true,
            inline: true,
            watch: true,
            watchOptions: {
               ignored: /node_modules/
            },
            https: true,
            quiet: false,
            stats: {
               colors: true
            }
         });

         devServer.use(devServer.middleware);

         // Launch WebpackDevServer
         return new Promise((resolve, reject) => {
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
      });
};

start.config = {
   name: 'start',
   description: 'Starts a development server',
   options: [
      ['p', 'port=ARG', 'Listening port (default 8080)']
   ]
};

/**
 * Builds a distributable package of widget.
 * @returns {Promise}
 */
const build = () => {
   process.env.NODE_ENV = 'production';
   return clean()
      .then(() => copyConfigFiles())
      .then(() => {
         return new Promise((resolve, reject) => {
            const config = require('../webpack.config.js'); // eslint-disable-line

            const compiler = webpack(config);
            compiler.run((err, stats) => {
               if (err) {
                  console.error(err);
                  reject();
                  return;
               }

               process.stdout.write(stats.toString(Object.assign(config, { colors: true })) + '\n');

               if (stats.compilation.errors.length > 0) {
                  reject();
                  return;
               }

               resolve(compiler);
            });
         });
      });
};

build.config = {
   name: 'build',
   description: 'Builds widget for production'
};

module.exports = [
   clean,
   build,
   start
];
