#!/usr/bin/env node

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');

function spawn (script, args) {
   var result = spawn.sync(
      script,
      args,
      { stdio: 'inherit' }
   );
   process.exit(result.status);
}

var script = process.argv[2];
switch (script) {
   case 'build:dev':
      console.log(chalk.cyan('Starting the development server...'));
      process.env.NODE_ENV = 'development';
      /* eslint-disable */
      var compiler = webpack(require('../webpack.development.config.js'));
      /* eslint-enable */
      var devServer = new WebpackDevServer(compiler, {
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
      // Launch WebpackDevServer.
      var port = 8080;
      devServer.listen(port, (err, result) => {
         if (err) {
            return console.log(err);
         }
         console.log('The app is running at:');
         console.log();
         console.log('  ' + chalk.cyan('https://localhost:' + port + '/'));
      });
      devServer.use(devServer.middleware);
      break;
   case 'build:prod':
      // process.env.NODE_ENV = 'production';
      // /* eslint-disable */
      // webpack(require('../webpack.development.config.js'));
      // /* eslint-enable */
      break;
   default:
      console.log('Unknown script "' + script + '".');
      console.log('Perhaps you need to update widget-build-tools?');
      break;
}
