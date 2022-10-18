import React, { createContext, useReducer, useContext } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

// Context value types.
interface SocketContextInterface {
  socket: Socket;
}

// Original context state values.
const SocketState: SocketContextInterface = {
  socket: undefined,
};

const Reducer = (state, action) => {
  if (action.type === 'reset') {
    return SocketState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const SocketContext: any = createContext<SocketContextInterface | null>(SocketState);

export const SocketProvider: any = (props: any) => {
  const [state, dispatch] = useReducer(Reducer, SocketState);

  // On mount, set the socket.
  React.useEffect((): any => {
    const newSocket = io();
    dispatch({ type: 'socket', value: newSocket });

    return () => newSocket.close();
  }, []);

  // Context state functions
  state.setSocket = (data: any) => {
    dispatch({ type: 'room', value: data });
  };

  state.resetSocket = () => {
    if (!state.socket) return;
    // All that is needed to be sent is the emit...
    // - the server will know who called it and for what room.
    state.socket.emit('resetRoom');
  };
  
  return (
    <SocketContext.Provider value={{ ...state }}>
      { props.children }
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext<SocketContextInterface>(SocketContext);