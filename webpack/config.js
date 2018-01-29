const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = env => {
  const isDev = env === 'development'
  const isProd = env === 'production'

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
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false,
          drop_console: true, // Kambi informed us they want the widgets to fail silently in production
        },
        mangle: {
          screw_ie8: true,
        },
        output: {
          comments: false,
          screw_ie8: true,
        },
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
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
          use: {
            loader: 'translations-loader',
          },
        },
        {
          test: /(\.js|\.jsx)$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['babel-preset-es2015', 'babel-preset-react'],
              ...(isProd && {
                plugins: ['babel-plugin-transform-react-remove-prop-types'],
              }),
            },
          },
        },
        {
          test: /(\.png|\.jpe?g)$/,
          use: 'url-loader',
        },
        {
          test: /\.html$/,
          use: 'html-loader',
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
