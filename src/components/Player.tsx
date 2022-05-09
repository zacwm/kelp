import * as React from 'react';

type Props = {
  roomId: any;
}

const Player: React.FC<Props> = ({ roomId }) => {
  
  return (
    <React.Fragment>
      <h1>Player - {roomId}</h1>
    </React.Fragment>
  );
};

export default Player;