// Webpack loader that injects the Widget API script tag into the page

module.exports = function(source) {
   this.cacheable(true);
   var wapiVersion = this.query.replace('?widgetApiVersion=', '');
   var replacement = `
<head>
   <script src="https://c3-static.kambi.com/sb-mobileclient/widget-api/${wapiVersion}/kambi-widget-api.js"></script>
`;
   return source.replace('<head>', replacement);
}
