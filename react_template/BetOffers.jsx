import React from 'react';
import { OutcomeButton } from 'kambi-widget-components';

const BetOffers = ( { event, betOffers } ) => {
   return (
      <div>
         {
            betOffers.map(( betOffer )=> {
               if ( betOffer.outcomes && betOffer.outcomes.length ) {
                  return (
                     <div className='eventContainer' key={betOffer.id}>
                        <span className='betoffer-label'>{betOffer.criterion.label}</span>
                        <div className='outcomesContainer'>
                           {betOffer.outcomes.map(outcome=>
                              <div className='outcomeContainer' key={outcome.id}>
                                 {/* Outcome button component
                                  https://github.com/kambi-sportsbook-widgets/widget-components/blob/master/README.md
                                 */}
                                 <OutcomeButton outcome={outcome} event={event} />
                              </div>
                           )}
                        </div>
                     </div>
                  )
               }
            }
         )
      }
      </div>
   );
};

BetOffers.propTypes = {

   betOffers: React.PropTypes.array.isRequired,
   event: React.PropTypes.object.isRequired,

};

export default BetOffers;
