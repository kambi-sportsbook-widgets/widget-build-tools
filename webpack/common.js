const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');


module.exports = {
   module: {
      rules: [
         {
            test: /\.scss$/,
            use: [
               {
                  loader: 'style-loader'
               },
               {
                  loader: 'css-loader',
                  options: {
                     modules: true
                  }
               },
               {
                  loader: 'postcss-loader'
               },
               {
                  loader: 'sass-loader'
               }
            ]
         },
         {
            test: /src(\/|\\)index\.html/,
            exclude: [
               path.resolve(process.cwd(), '/node_modules/')
            ],
            use: {
               loader: 'widget-api-loader'
            }
         },
         {
            test: /\.js$/,
            use: {
               loader: 'babel-loader',
               options: {
                  presets: ['babel-preset-es2015']
               }
            },
         },
         {
            test: /\.jsx$/,
            use: {
               loader: 'babel-loader',
               options: {
                  presets: ['babel-preset-es2015', 'babel-preset-react']
               }
            },
         },
         {
            test: /(\.png|\.jpe?g)$/,
            use: 'url-loader'
         },
         {
            test: /\.html$/,
            use: 'html-loader'
         }
      ]
   },
   output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: '[name].js'
   },
   resolve: {
      extensions: ['.js', '.jsx', '.json', '.scss', '.html'],
      modules: [
         path.resolve(__dirname, 'node_modules'),
         path.resolve(process.cwd(), 'node_modules')
      ]
   },
   resolveLoader: {
      symlinks: true,
      alias: {
         'widget-api-loader': path.resolve(__dirname, 'widget-api-loader')
      }
   },
   plugins: [
      new webpack.DefinePlugin({
         'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV)
         }
      }),
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
         },
         {
            from: './src/assets',
            to: 'assets'
         }
      ])
   ]
};
