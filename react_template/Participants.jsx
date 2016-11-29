import React from 'react';

const Participants = ( { homeName, awayName, onClick } ) => {
   return (
      <div className='participants'onClick={onClick}>
         <span className='participants-font-size'> {homeName} </span>
         <span className='participants-font-size'> - </span>
         <span className='participants-font-size'> {awayName} </span>
      </div>
   );
};

Participants.propTypes = {

   homeName: React.PropTypes.string.isRequired,

   awayName: React.PropTypes.string.isRequired,

   onClick: React.PropTypes.func.isRequired
};

export default Participants;
