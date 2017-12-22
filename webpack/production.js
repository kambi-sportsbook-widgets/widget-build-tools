const webpack = require('webpack')
const path = require('path');


const useRealReact = Object.assign(
   { production: false },
   require(path.resolve(process.cwd(), 'package.json')).useRealReact || {}
).production;

module.exports = {
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
