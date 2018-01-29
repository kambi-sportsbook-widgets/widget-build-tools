module.exports = {
  plugins: [
    require('autoprefixer')({
      browsers: ['ie >= 11', 'ios_saf >= 7', 'and_chr >= 5', 'Last 1 versions'],
    }),
  ],
}
