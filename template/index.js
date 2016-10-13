import {
   coreLibrary,
   widgetModule,
   offeringModule
} from 'widget-core-library';
import './index.html';
import './app.scss';

coreLibrary.init({
   // default arguments
   title: '${projectName}'
}).then(function () {
   // retrieved arguments
   var args = coreLibrary.args;

   // receiving the title through this widget arguments
   document.getElementById('title').innerText = args.title;

   offeringModule.getLiveEvents()
      .then(function (data) {
         // showing basic information of the first live event we get
         var ev = data.events[0].event;
         var liveData = data.events[0].liveData;
         var homeHtml = document.getElementById('home-info');
         var awayHtml = document.getElementById('away-info');
         var matchInfo = document.getElementById('match-info');
         matchInfo.innerText = ev.name;
         homeHtml.innerText = ev.homeName + ' - ' + liveData.score.home;
         awayHtml.innerText = liveData.score.away + ' - ' + ev.awayName;
         // make the widget the same height as the body
         widgetModule.adaptWidgetHeight();
      }).catch(function(err) {
         // could not fetch the data
         // or an error happened while parsing it
         console.error(err);
         // making widget remove itself from the sportsbook
         widgetModule.removeWidget();
      });
});
