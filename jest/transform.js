const babelJest = require('babel-jest')

module.exports = babelJest.createTransformer({
  presets: [
    [
      require('babel-preset-env'),
      {
        targets: {
          node: 'current',
        },
        useBuiltIns: false, // polyfills are done manually in the core-library
        modules: 'commonjs',
      },
    ],
    require('babel-preset-react'),
  ],
  plugins: [
    require('babel-plugin-transform-class-properties'),
    require('babel-plugin-transform-object-rest-spread'),
  ],
  babelrc: false,
})
