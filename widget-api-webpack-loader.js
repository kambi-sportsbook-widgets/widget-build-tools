// Webpack loader that injects the Widget API script tag into the page

const path = require('path');
const constants = require(path.join(process.cwd(), 'node_modules/kambi-widget-core-library/src/constants'));

console.log('bbb');
module.exports = function(source) {
   this.cacheable(true);
   console.log('aaa');
   const version = constants.widgetApiVersion;
   var replacement = `
<head>
   <script src="https://c3-static.kambi.com/sb-mobileclient/widget-api/${version}/kambi-widget-api.js"></script>
`;
   return source.replace('<head>', replacement);
}
