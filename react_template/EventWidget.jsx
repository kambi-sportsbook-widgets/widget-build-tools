import React from 'react'
import { Header } from 'kambi-widget-components'
import { widgetModule, translationModule } from 'kambi-widget-core-library'
import Participants from './Participants'
import BetOffers from './BetOffers'

/**
 * Navigate to event
 * @param {Object} event
 */
const navigateToEvent = event => {
  if (event.event.liveBetOffers) {
    // Navigate to live event
    // http://kambi-sportsbook-widgets.github.io/widget-core-library/module-widgetModule.html#.navigateToLiveEvent__anchor
    widgetModule.navigateToLiveEvent(event.event.id)
  } else {
    // Navigate to prelive event
    // http://kambi-sportsbook-widgets.github.io/widget-core-library/module-widgetModule.html#.navigateToEvent__anchor
    widgetModule.navigateToEvent(event.event.id)
  }
}

/**
 * Check if the event is live and return a label to be added to the title
 * @param event
 * @returns {String} Either the translated label or an empty string
 */
const liveLabel = event => {
  if (event.event.liveBetOffers) {
    // Translate a string
    // http://kambi-sportsbook-widgets.github.io/widget-core-library/module-translationModule.html#.getTranslation__anchor
    return ' - ' + translationModule.getTranslation('liveRightNow')
  }
  return ''
}

class EventWidget extends React.Component {
  /**
   * Called after the component is mounted
   **/
  componentDidMount() {
    // Adjust widget height
    // http://kambi-sportsbook-widgets.github.io/widget-core-library/module-widgetModule.html#.adaptWidgetHeight__anchor
    widgetModule.adaptWidgetHeight()
  }

  render() {
    return (
      <div className="KambiWidget-card-background-color">
        {/* Calls the header component
             https://github.com/kambi-sportsbook-widgets/widget-components/blob/master/README.md
             */}
        <Header>{this.props.title + liveLabel(this.props.event)}</Header>
        <Participants
          homeName={this.props.event.event.homeName}
          awayName={this.props.event.event.awayName}
          onClick={navigateToEvent.bind(null, this.props.event)}
        />
        <BetOffers
          betOffers={this.props.event.betOffers}
          event={this.props.event.event}
        />
      </div>
    )
  }
}

EventWidget.propTypes = {
  event: React.PropTypes.object,

  title: React.PropTypes.string.isRequired,
}

export default EventWidget
