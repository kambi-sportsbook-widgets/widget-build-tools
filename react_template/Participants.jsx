import React from 'react';
import styles from './Participants.scss';

const Participants = ( { homeName, awayName, onClick } ) => {
   return (
      <div className={styles.participants} onClick={onClick}>
         <span className={styles['participants-font-size']}> {homeName} </span>
         <span className={styles['participants-font-size']}> - </span>
         <span className={styles['participants-font-size']}> {awayName} </span>
      </div>
   );
};

Participants.propTypes = {

   homeName: React.PropTypes.string.isRequired,

   awayName: React.PropTypes.string.isRequired,

   onClick: React.PropTypes.func.isRequired
};

export default Participants;
