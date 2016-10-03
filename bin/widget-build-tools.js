#!/usr/bin/env node

var spawn = require('cross-spawn');

var script = process.argv[2];
// const args = process.argv.slice(3);

function spawn (script, args) {
   var result = spawn.sync(
      'node',
      [require.resolve('../scripts/' + script)].concat(args),
      { stdio: 'inherit' }
   );
   process.exit(result.status);
}

switch (script) {
   case 'build:dev':
      spawn(script, []);
      break;
   case 'build:prod':
      spawn(script, []);
      break;
   default:
      console.log('Unknown script "' + script + '".');
      console.log('Perhaps you need to update widget-build-tools?');
      break;
}
