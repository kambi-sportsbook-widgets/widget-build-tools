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
         NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
   })
];

let scssLoaders = [
   'style-loader',
   'css-loader?sourceMap&localIdentName=[name]__[local]___[hash:base64:5]',
   'sass-loader?sourceMap'
];

let appEntry = [
   './src/index.js',
   'webpack/hot/dev-server',
   'webpack-dev-server/client?https://localhost:8080/'
];

const resolve = {
   extensions: ['', '.js', '.jsx', '.json', '.scss', '.html'],
   alias: {
      react: 'react-lite',
      'react-dom': 'react-lite'
   }
};

const useRealReact = Object.assign(
   { development: true, production: false },
   require(path.join(process.cwd(), 'package.json')).useRealReact || {} // eslint-disable-line
);

if (process.env.NODE_ENV === 'production') {
   devtool = false;

   // removing dev-server from entry
   appEntry = appEntry.slice(0, 1);

   scssLoaders = [
      'style-loader',
      'css-loader',
      'sass-loader'
   ];

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

module.exports = validate({
   devtool: devtool,
   plugins: plugins,
   entry: {
      app: appEntry
   },
   stats: {
      errorDetails: true,
   },
   module: {
      preLoaders: [
         {
            test: /src\/.*\.jsx?$/,
            exclude: [
               /node_modules/,
               /kambi-widget-core-library/,
               /kambi-widget-build-tools/
            ],
            loader: `eslint-loader?{configFile:"${path.join(__dirname + '/widget_config', '.eslintrc')}"}`
         }
      ],
      loaders: [
         {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
               presets: [require.resolve('babel-preset-es2015')]
            }
         },
         {
            test: /\.jsx$/,
            loader: 'babel-loader',
            query: {
               presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-react')]
            }
         },
         {
            test: /\.scss$/,
            loaders: scssLoaders
         },
         {
            test: /(\.png|\.jpe?g)$/,
            loader: "url-loader"
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
      publicPath: "https://localhost:8080/",
      path: path.resolve(process.cwd(), 'dist'),
      filename: '[name].js'
   },
   resolve: resolve,
});
