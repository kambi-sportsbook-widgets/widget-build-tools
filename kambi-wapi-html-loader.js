// Webpack loader that injects the Widget API script tag into the page

const path = require('path');
const constants = require(path.join(process.cwd(), 'node_modules/kambi-widget-core-library/src/constants'));

module.exports = function(source) {
   this.cacheable(true);
   var replacement = `
<head>
   <script src="https://c3-static.kambi.com/sb-mobileclient/widget-api/${constants.widgetApiVersion}/kambi-widget-api.js"></script>
`;
   return source.replace('<head>', replacement);
}
