import {
  coreLibrary,
  widgetModule,
  offeringModule,
} from 'kambi-widget-core-library'
import './index.html'
import './app.scss'

coreLibrary
  .init({
    // default arguments
    title: '${projectName}',
  })
  .then(function() {
    // retrieved arguments
    var args = coreLibrary.args

    // receiving the title through this widget arguments
    document.getElementById('title').innerText = args.title

    offeringModule
      .getLiveEvents()
      .then(function(data) {
        // showing basic information of the first live match we get
        var ev = null
        var liveData = null
        for (var i = 0; i < data.events.length; i++) {
          if (data.events[i].event.type === 'ET_MATCH') {
            ev = data.events[i].event
            liveData = data.events[i].liveData
          }
        }
        if (ev == null) {
          throw new Error('No match to show')
        }
        var homeHtml = document.getElementById('home-info')
        var awayHtml = document.getElementById('away-info')
        var matchInfo = document.getElementById('match-info')
        matchInfo.innerText = ev.name
        homeHtml.innerText = ev.homeName
        awayHtml.innerText = ev.awayName
        if (liveData != null && liveData.score != null) {
          homeHtml.innerText = homeHtml.innerText + ' - ' + liveData.score.home
          awayHtml.innerText = liveData.score.away + ' - ' + awayHtml.innerText
        }
        // make the widget the same height as the body
        widgetModule.adaptWidgetHeight()
      })
      .catch(function(err) {
        // could not fetch the data
        // or an error happened while parsing it
        console.error(err)
        // making widget remove itself from the sportsbook
        widgetModule.removeWidget()
      })
  })
