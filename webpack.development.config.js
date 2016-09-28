const path = require('path');
const validate = require('webpack-validator');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

module.exports = validate({
   entry: {
      app: ['./src/index.js']
   },
   module: {
      preLoaders: [
         { test: /.js$/, exclude: /widget-core-library/, loader: `eslint-loader?{configFile:"${path.join(__dirname, '.eslintrc')}"}` }
      ],
      loaders: [
         {test: /\.svg/, loader: 'svg-url-loader'},
         {test: /(\.ttf|\.woff2?|\.eot)/, loader: 'url-loader'},
         { test: /.js$/, exclude: /node_modules/, loader: 'babel-loader', query: { presets: ['es2015'] } },
         { test: /\.scss$/, loaders: ['style-loader', 'css-loader?sourceMap', 'sass-loader?sourceMap'] },
         { test: /\.html/, loader: 'html-loader' },
         { test: /\.json$/, loader: 'json-loader' }]
   },
   resolveLoader: { root: fs.existsSync(path.join(__dirname, "node_modules")) ? path.join(__dirname, "node_modules") : path.resolve('./../') },
   devtool: 'source-map',
   output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: 'js/[name].js'
   },
   devServer: {
      contentBase: './src'
   },
   resolve: {
      extensions: ['', '.js', '.json', '.scss', '.html']
   },
   plugins: [
      new HtmlWebpackPlugin({template: 'src/index.html'}),
      new CopyWebpackPlugin([
         { from: './src/i18n', to: 'i18n' },
         { from: path.join(__dirname, 'widget_config', 'mockSetupData.json'), to: '.' }
      ])
   ]
});
