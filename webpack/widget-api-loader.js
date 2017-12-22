// Webpack loader that injects the Widget API script tag into the page
const path = require('path');

let widgetApiVersion;
try {
   widgetApiVersion = require('kambi-widget-core-library/src/constants').widgetApiVersion;
} catch (err) {
   // For symlinks
   const coreLib = path.join(process.cwd(), 'node_modules/kambi-widget-core-library/src/constants')

   widgetApiVersion = require(coreLib).widgetApiVersion;
}

module.exports = function (source) {
   this.cacheable(true);
   return source.replace(
      '<head>',
      `<head>\\n<script src=\\"common.js\\"></script>\\n<script src=\\"polyfills.js\\"></script><script src=\\"https://c3-static.kambi.com/sb-mobileclient/widget-api/${widgetApiVersion}/kambi-widget-api.js\\"></script>`
   );
};
