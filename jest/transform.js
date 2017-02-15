const babelJest = require('babel-jest'),
   path = require('path');

const transformer = babelJest.createTransformer({presets: [
   path.resolve(__dirname, '../node_modules/babel-preset-es2015'),
   path.resolve(__dirname, '../node_modules/babel-preset-react')
]});

module.exports = transformer;
