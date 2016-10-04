import { coreLibrary, widgetModule } from 'widget-core-library';
import './index.html';
import './scss/app.scss';

coreLibrary.init({
   // default arguments
}).then(() => {
   // retrieved arguments
   const args = coreLibrary.args;
});
