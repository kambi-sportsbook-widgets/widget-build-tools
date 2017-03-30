const webpack = require('webpack');
const path = require('path');


const useRealReact = Object.assign(
   { development: true },
   require(path.resolve(process.cwd(), 'package.json')).useRealReact || {}
).development;


module.exports = {
   devtool: 'source-map',
   entry: {
      app: [
         './src/index.js',
         'webpack/hot/dev-server',
         'webpack-dev-server/client?https://localhost:8080/'
      ]
   },
   module: {
      rules: [
         {
            test: /\.scss$/,
            use: [
               {
                  loader: 'css-loader',
                  options: {
                     sourceMap: true,
                     localIdentName: '[name]__[local]___[hash:base64:5]'
                  }
               },
               {
                  loader: 'postcss-loader',
                  options: {
                     sourceMap: true
                  }
               },
               {
                  loader: 'sass-loader',
                  options: {
                     sourceMap: true
                  }
               }
            ]
         }
      ]
   },
   plugins: [
      new webpack.HotModuleReplacementPlugin()
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
