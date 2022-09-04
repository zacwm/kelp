import React, { createContext, useReducer, useContext } from 'react';
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

  // Context state functions
  state.setSocket = (data: any) => {
    dispatch({ type: 'room', value: data });
  };

  state.resetSocket = () => {
    state.socket.emit('resetRoom');
  };
  
  return (
    <SocketContext.Provider value={{ ...state }}>
      { props.children }
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext<SocketContextInterface>(SocketContext);