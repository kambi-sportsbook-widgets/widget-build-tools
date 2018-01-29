import React from 'react'
import ReactDOM from 'react-dom'
import {
  coreLibrary,
  widgetModule,
  offeringModule,
} from 'kambi-widget-core-library'
import EventWidget from './js/Components/EventWidget'
import './scss/app.scss'
import './index.html'

// Initialize kambi's api
// http://kambi-sportsbook-widgets.github.io/widget-core-library/module-coreLibrary.html#.init__anchor
coreLibrary
  .init({
    eventId: null,
    title: 'Event Widget',
  })
  .then(() => {
    // Check if the widget has an eventId supplied and get that event. If not get live events
    if (coreLibrary.args.eventId !== null) {
      // Get event
      // http://kambi-sportsbook-widgets.github.io/widget-core-library/module-offeringModule.html#.getEvent__anchor
      return offeringModule.getEvent(coreLibrary.args.eventId)
    } else {
      // Get live events
      return offeringModule.getLiveEvents()
    }
  })
  .then(events => {
    let event
    // Figure out if we have an array of events or a single one
    if (events.events) {
      for (let i = 0; i < events.events.length; i++) {
        // Check that the event is a match and has betoffers
        if (
          !event &&
          events.events[i].event.type === 'ET_MATCH' &&
          events.events[i].betOffers.length
        ) {
          event = events.events[i]
        }
      }
      // Get the event with all its betoffers (getLiveEbents only returns one betoffer)
      // http://kambi-sportsbook-widgets.github.io/widget-core-library/module-offeringModule.html#.getLiveEventsByFilter__anchor
      return offeringModule.getLiveEvent(event.event.id)
    }
    // Check that the event type is 'ET_MATCH' and has betoffers
    if (events.event.type === 'ET_MATCH' && events.event.betoffers.length) {
      return events
    }
    throw new Error(
      'Event widget: The id provided does not correspont to a match or has no bet offers',
      events.event
    )
  })
  .then(event => {
    // Renders the widget
    ReactDOM.render(
      React.createElement(EventWidget, {
        event: event,
        title: coreLibrary.args.title,
      }),
      document.getElementById('root')
    )
  })
  .catch(error => {
    widgetModule.removeWidget()
    console.debug('event widget:', error)
    throw error
  })
