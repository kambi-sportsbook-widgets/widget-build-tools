import React from 'react'
import { OutcomeButton } from 'kambi-widget-components'
import styles from './BetOffers.scss'

const BetOffers = ({ event, betOffers }) => {
  return (
    <div>
      {betOffers.map(betOffer => {
        if (betOffer.outcomes && betOffer.outcomes.length) {
          return (
            <div className={styles.event} key={betOffer.id}>
              <span className={styles['betoffer-label']}>
                {betOffer.criterion.label}
              </span>
              <div className={styles.outcomes}>
                {betOffer.outcomes.map(outcome => (
                  <div className={styles.outcome} key={outcome.id}>
                    {/* Outcome button component
                                  https://github.com/kambi-sportsbook-widgets/widget-components/blob/master/README.md
                                 */}
                    <OutcomeButton outcome={outcome} event={event} />
                  </div>
                ))}
              </div>
            </div>
          )
        }
      })}
    </div>
  )
}

BetOffers.propTypes = {
  betOffers: React.PropTypes.array.isRequired,
  event: React.PropTypes.object.isRequired,
}

export default BetOffers
