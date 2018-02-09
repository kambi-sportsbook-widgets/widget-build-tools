const babelJest = require('babel-jest')
const babelPresets = require('../webpack/babel-presets')

module.exports = babelJest.createTransformer(babelPresets)
