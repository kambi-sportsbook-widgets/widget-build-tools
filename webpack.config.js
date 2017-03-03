const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production'
   && process.env.NODE_ENV !== 'development') {
   throw new Error('Environment variable NODE_ENV not set, please set it to either "production" or "development"')
}

let devtool = 'source-map';

let plugins = [
   new webpack.DefinePlugin({
      'process.env': {
         NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
   })
];

let scssLoaders = [
   'style-loader',
   'css-loader?sourceMap&localIdentName=[name]__[local]___[hash:base64:5]',
   'postcss-loader?sourceMap',
   'sass-loader?sourceMap'
];

let appEntry = [
   './src/index.js',
   'webpack/hot/dev-server',
   'webpack-dev-server/client?https://localhost:8080/'
];

const resolve = {
   extensions: ['.js', '.jsx', '.json', '.scss', '.html'],
   alias: {
      'react': 'react-lite',
      'react-dom': 'react-lite'
   },
   modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(process.cwd(), 'node_modules')
   ]
};

const useRealReact = Object.assign(
   { development: true, production: false },
   require(path.resolve(process.cwd(), 'package.json')).useRealReact || {} // eslint-disable-line
);

if (process.env.NODE_ENV === 'production') {
   devtool = false;

   // removing dev-server from entry
   appEntry = appEntry.slice(0, 1);

   scssLoaders = [
      'style-loader',
      'css-loader?-autoprefixer',
      'postcss-loader',
      'sass-loader'
   ];

   plugins = plugins.concat([
      new webpack.optimize.CommonsChunkPlugin({name: 'common'}),
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
   ]);

   if (useRealReact.production) {
      delete resolve.alias;
   }
} else {
   if (useRealReact.development) { // eslint-disable-line
      delete resolve.alias;
   }
}

if (module.hot) {
   module.hot.accept();
}

plugins = plugins.concat([
   new webpack.HotModuleReplacementPlugin(),
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

module.exports = {
   devtool: devtool,
   plugins: plugins,
   entry: {
      app: appEntry
   },
   stats: {
      errorDetails: true,
   },
   module: {
      rules: [
         {
            // this loader includes the script tag for the Kambi API file
            test: /src(\/|\\)index\.html/,
            exclude: [
               path.resolve(process.cwd(), '/node_modules/')
            ],
            // resolveLoader.alias maps this name to the script
            use: {
               loader: 'widget-api-webpack-loader'
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
            test: /\.scss$/,
            use: [
               'style-loader',
               'css-loader?sourceMap&localIdentName=[name]__[local]___[hash:base64:5]',
               'postcss-loader?sourceMap',
               'sass-loader?sourceMap'
            ]
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
   resolveLoader: {
      symlinks: true,
      alias: {
         'widget-api-webpack-loader': path.resolve(__dirname, 'widget-api-webpack-loader')
      }
   },
   output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: '[name].js'
   },
   resolve: resolve,
};
