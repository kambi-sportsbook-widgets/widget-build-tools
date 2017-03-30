const merge = require('webpack-merge');


if (['development', 'production'].indexOf(process.env.NODE_ENV)) {
   throw new Error('Environment variable NODE_ENV not set, please set it to either "production" or "development"');
}


module.exports = merge.smart([
   require('./webpack/common'),
   require(`./webpack/${process.env.NODE_ENV}`)
]);
