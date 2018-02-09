module.exports = [
  [
    require('babel-preset-env'),
    {
      targets: {
        browsers: ['last 2 versions', 'ie >= 11'],
      },
      useBuiltIns: false, // polyfills are done manually in the core-library
    },
  ],
  require('babel-preset-react'),
]
