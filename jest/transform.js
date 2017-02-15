const babelJest = require('babel-jest'),
   path = require('path');

const transformer = babelJest.createTransformer({presets: [
   'babel-preset-es2015',
   'babel-preset-react'
]});

module.exports = transformer;
