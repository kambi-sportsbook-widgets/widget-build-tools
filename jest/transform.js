const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
   presets: [
      'babel-preset-es2015',
      'babel-preset-react'
   ]
});
