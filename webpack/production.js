const webpack = require('webpack')
const path = require('path');


const useRealReact = Object.assign(
   { production: false },
   require(path.resolve(process.cwd(), 'package.json')).useRealReact || {}
).production;


module.exports = {
   entry: {
      app: './src/index.js'
   },
   module: {
      rules: [
         {
            test: /\.jsx$/,
            use: {
               loader: 'babel-loader',
               options: {
                  presets: ['babel-preset-es2015', 'babel-preset-react'],
                  plugins: ['babel-plugin-transform-react-remove-prop-types']
               }
            },
         }
      ]
   },
   plugins: [
      new webpack.optimize.CommonsChunkPlugin({
         name: 'common'
      }),
      new webpack.optimize.UglifyJsPlugin({
         compress: {
            screw_ie8: true,
            warnings: false,
            drop_console: true // Kambi informed us they want the widgets to fail silently in production
         },
         mangle: {
            screw_ie8: true
         },
         output: {
            comments: false,
            screw_ie8: true
         }
      }),
      new webpack.optimize.AggressiveMergingPlugin()
   ],
   resolve: Object.assign(
      {},
      useRealReact
         ? {}
         : {
            alias: {
               'react': 'react-lite',
               'react-dom': 'react-lite'
            }
         }
   )
};
