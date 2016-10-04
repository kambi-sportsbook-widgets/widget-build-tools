const path = require('path');
const validate = require('webpack-validator');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production'
      && process.env.NODE_ENV !== 'development') {
   throw new Error('Environment variable NODE_ENV not set, please set it to either "production or "development"')
}


let devtool = 'source-map';

let plugins = [
   new webpack.DefinePlugin({
      'process.env': {
         NODE_ENV: process.env.NODE_ENV
      }
   })
];

if (process.env.NODE_ENV === 'production') {
   devtool = false;

   plugins = plugins.concat([
      new webpack.optimize.CommonsChunkPlugin('common.js'),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
         compress: {
            screw_ie8: true,
            warnings: false
         },
         mangle: {
            screw_ie8: true
         },
         output: {
            comments: false,
            screw_ie8: true
         }
      }),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
   ]);
}

plugins = plugins.concat([
   new HtmlWebpackPlugin({
      template: 'src/index.html'
   }),
   new CopyWebpackPlugin([
      {
         from: './src/i18n',
         to: 'i18n'
      },
      {
         from: './src/mockSetupData.json',
         to: '.'
      }
   ])
]);

module.exports = validate({
   devtool: devtool,
   plugins: plugins,
   entry: {
      app: ['./src/index.js']
   },
   stats: {
      errorDetails: true,
   },
   module: {
      preLoaders: [
         {
            test: /src\/.*.js$/,
            exclude: [
               /node_modules/,
               /widget-core-library/,
               /widget-build-tools/
            ],
            loader: `eslint-loader?{configFile:"${path.join(__dirname, '.eslintrc')}"}`
         }
      ],
      loaders: [
         {
            test: /\.svg/,
            loader: 'svg-url-loader'
         },
         {
            test: /(\.ttf|\.woff2?|\.eot)/,
            loader: 'url-loader'
         },
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
         }
      ]
   },
   resolveLoader: {
      root: fs.existsSync(
         path.join(__dirname, 'node_modules')) ?
            path.join(__dirname, 'node_modules') :
            path.join(process.cwd(), 'node_modules'
         )
   },
   output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: '[name].js'
   },
   resolve: {
      extensions: ['', '.js', '.json', '.scss', '.html']
   },
});
