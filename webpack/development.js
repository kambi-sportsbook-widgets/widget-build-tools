const webpack = require('webpack')
const path = require('path')
const chalk = require('chalk')

const getLocalIp = require('../bin/localIp').getLocalIp

const pkg = require(path.resolve(process.cwd(), 'package.json'))

const useHttps = Object.assign(pkg, {
  useHttps: pkg.useHttps == true ? true : false,
}).useHttps

let devServer = {
  contentBase: path.join(__dirname, 'dist'),
  port: 8080,
  inline: true,
  hot: true,
  host: 'localhost',
  stats: {
    colors: true,
    errors: true,
    warnings: false,
    modules: false,
    chunks: false,
    assets: false,
    hash: false,
  },
  useLocalIp: true,
  after: function() {
    const protocol = this.https ? 'https://' : 'http://'

    const localHost = `Locally: ${chalk.cyan(
      protocol + this.host + ':' + this.port + '/'
    )}`
    const localIp = `Local IP: ${chalk.cyan(
      protocol + getLocalIp() + ':' + this.port + '/'
    )}`

    console.log(`
      The app is running at:

      ${localHost}
      ${localIp}
      `)
  },
}

if (useHttps) {
  console.log('Using self signed certificates over https')
  devServer['https'] = useHttps
}

module.exports = {
  devServer,
}
