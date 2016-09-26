const path = require('path');
const validate = require('webpack-validator');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = validate({
   entry: {
      app: ['./src/index.js']
   },
   module: {
      preLoaders: [
         { test: /.js$/, exclude: /node_modules/, loader: 'eslint-loader' }
      ],
      loaders: [
         { test: /\.svg/, loader: 'svg-url-loader' },
         { test: /.js$/, exclude: /node_modules/, loader: 'babel-loader', query: { presets: ['es2015'] } },
         { test: /\.(ttf|woff)$|\.eot$/, loader: 'file', query: { name: 'fonts/[name].[ext]' }, },
         {
            test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
            exclude: /node_modules/,
            loader: 'url-loader?importLoaders=1&limit=100000'
         },
         { test: /\.scss$/, loaders: ['style', 'css?sourceMap', 'sass?sourceMap'] },
         { test: /\.html/, loader: 'html-loader' },
         { test: /\.json$/, loader: 'json-loader' }]
   },
   devtool: 'source-map',
   output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].js'
   },
   devServer: {
      contentBase: './src'
   },
   resolve: {
      extensions: ['', '.js', '.json', '.scss', '.html']
   },
   plugins: [new HtmlWebpackPlugin({
      template: 'src/index.html'
   })]
});