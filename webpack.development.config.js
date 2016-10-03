var path = require('path');
var validate = require('webpack-validator');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var fs = require('fs');

module.exports = validate({
   entry: {
      app: ['./src/index.js']
   },
   module: {
      preLoaders: [
         { test: /src\/.*.js$/, exclude: /node_modules/, loader: `eslint-loader?{configFile:"${path.join(__dirname, '.eslintrc')}"}` }
      ],
      loaders: [
         {
            test: /\.svg/,
            loader: 'svg-url-loader' },
         {
            test: /(\.ttf|\.woff2?|\.eot)/,
            loader: 'url-loader' },
         {
            test: /.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
               presets: [require.resolve('babel-preset-es2015')]
            }
         },
         {
            test: /\.scss$/,
            loaders: [
               'style-loader',
               'css-loader?sourceMap', 'sass-loader?sourceMap'
            ]
         },
         {
            test: /\.html/,
            loader: 'html-loader'
         },
         {
            test: /\.json$/,
            loader: 'json-loader'
         }]
   },
   resolveLoader: {
      root: fs.existsSync(
         path.join(__dirname, 'node_modules')) ?
            path.join(__dirname, 'node_modules') :
            path.join(process.cwd(), 'node_modules'
         )
   },
   devtool: 'source-map',
   output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: 'js/[name].js'
   },
   resolve: {
      extensions: ['', '.js', '.json', '.scss', '.html']
   },
   plugins: [
      new webpack.DefinePlugin({
         'process.env': {
            NODE_ENV: process.env.NODE_ENV
         }
      }),
      new HtmlWebpackPlugin({
         template: 'src/index.html'
      }),
      new CopyWebpackPlugin([
         { from: './src/i18n', to: 'i18n' },
         { from: path.join(__dirname, 'widget_config', 'mockSetupData.json'), to: '.' }
      ])
   ]
});
