const path = require('path');
const validate = require('webpack-validator');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

module.exports = validate({
   entry: {
      'main': ['./src/index.js']
   },
   module: {
      loaders: [
         {test: /\.svg/, loader: 'svg-url-loader'},
         {test: /.js$/, exclude: /node_modules/, loader: 'babel-loader', query: {presets: ['es2015']}},
         {
            test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
            exclude: /node_modules/,
            loader: 'url-loader?importLoaders=1&limit=100000'
         },
         {test: /\.json$/, loader: 'json'},
         {test: /\.html/, loader: 'html-loader'},
         {test: /\.scss$/, loaders: ['style', 'css', 'sass']}]
   },
   resolveLoader: { root: fs.existsSync(path.join(__dirname, "node_modules")) ? path.join(__dirname, "node_modules") : path.resolve('./../') },
   output: {
      path: path.resolve(process.cwd(), 'dist'),
      publicPath: '/widget3/',
      filename: '[name].js'
   },
   plugins: [
      new webpack.optimize.CommonsChunkPlugin('common.js'),
      new webpack.optimize.DedupePlugin(),
     /* new webpack.optimize.UglifyJsPlugin({
         compressor: {
            warnings: true,
         },
      }),*/
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
//      new HtmlWebpackPlugin({ template: 'src/index.html'}),
      new CopyWebpackPlugin([{
         from: './src/i18n',
         to: 'i18n'
      },{
         from: './src/mockSetupData.json',
         to: '.'
      }])
   ],
   resolve: {
      extensions: ['', '.js', '.json', '.scss']
   }
});
