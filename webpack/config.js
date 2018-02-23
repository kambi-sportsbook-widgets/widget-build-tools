const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const path = require('path')

module.exports = env => {
  const isDev = env === 'development'
  const isProd = env === 'production'

  const babelLoader = {
    loader: 'babel-loader',
    options: {
      presets: require('./babel-presets'),
      plugins: [
        require('babel-plugin-transform-class-properties'),
        require('babel-plugin-transform-object-rest-spread'),
      ].concat(
        isProd
          ? [require('babel-plugin-transform-react-remove-prop-types').default]
          : []
      ),
    },
  }

  let plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
      inject: 'head',
    }),
    new CopyWebpackPlugin([
      {
        from: './src/mockSetupData.json',
        to: '.',
      },
      {
        from: './src/assets',
        to: 'assets',
      },
    ]),
  ]

  if (isProd) {
    plugins = [
      ...plugins,
      new UglifyJsPlugin({
        uglifyOptions: {
          ie8: false,
          compress: {
            drop_console: true, // Kambi informed us they want the widgets to fail silently in production
          },
        },
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
    ]
  }

  return {
    entry: {
      main: './src/index.js',
    },
    ...(isDev && { devtool: 'source-map' }),
    module: {
      rules: [
        {
          oneOf: [
            // oneOf makes sure only one loader runs
            {
              test: /\.scss$/,
              use: [
                {
                  loader: 'style-loader',
                },
                {
                  loader: 'css-loader',
                  options: {
                    modules: true,
                    ...(isDev && {
                      sourceMap: true,
                      localIdentName: '[name]__[local]___[hash:base64:5]',
                    }),
                  },
                },
                {
                  loader: 'postcss-loader',
                  ...(isDev && { options: { sourceMap: true } }),
                },
                {
                  loader: 'sass-loader',
                  ...(isDev && { options: { sourceMap: true } }),
                },
              ],
            },
            {
              test: /src(\/|\\)index\.js/,
              exclude: [path.resolve(process.cwd(), '/node_modules/')],
              use: [
                {
                  loader: 'translations-loader',
                },
                babelLoader,
              ],
            },
            {
              test: /(\.js|\.jsx)$/,
              use: babelLoader,
            },
            {
              test: /(\.png|\.jpe?g)$/,
              use: 'url-loader',
            },
            {
              test: /\.html$/,
              use: 'html-loader',
            },
            {
              // if no other loader matches, it will fallback to this loader
              loader: require.resolve('file-loader'),
              options: {
                name: 'assets/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.scss', '.html'],
      modules: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(process.cwd(), 'node_modules'),
      ],
    },
    resolveLoader: {
      symlinks: true,
      alias: {
        'translations-loader': path.resolve(__dirname, 'translations-loader'),
      },
    },
    plugins,
  }
}
