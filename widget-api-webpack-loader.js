// Webpack loader that injects the Widget API script tag into the page
const widgetApiVersion = require('kambi-widget-core-library/src/constants').widgetApiVersion;

module.exports = function(source) {
   this.cacheable(true);
   return source.replace(
      '<head>',
      `<head>\\n<script src=\\"https://c3-static.kambi.com/sb-mobileclient/widget-api/${widgetApiVersion}/kambi-widget-api.js\\"></script>`
   );
};
