const merge = require('webpack-merge');

const env = process.env.NODE_ENV

if (['development', 'production'].indexOf(env) === -1) {
   throw new Error('Environment variable NODE_ENV not set, please set it to either "production" or "development"');
}

const mergedConfig = merge.smart([
   require('./webpack/config')(env),
   require(`./webpack/${env}`)
]);

module.exports = mergedConfig
