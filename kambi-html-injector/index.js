/*
This loader adds the script tag to the Widget API to the head section of the page

Webpack requires loaders to be separate packages but we didn't want to create another repo only for this loader, so it is present inside the build-tools itself
In development mode when this file is edited it is required to

rm -rf node_modules/kambi-html-injector/
followed by
npm install

to see the changes
*/

module.exports = function(source) {
   this.cacheable(true);
   var wapiVersion = this.query.replace('?widgetApiVersion=', '');
   var replacement = `
<head>
   <script src="https://c3-static.kambi.com/sb-mobileclient/widget-api/${wapiVersion}/kambi-widget-api.js"></script>
`;
   return source.replace('<head>', replacement);
}
