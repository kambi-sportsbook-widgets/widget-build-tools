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
   plugins: [
      new webpack.optimize.CommonsChunkPlugin({
         name: 'common'
      }),
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
