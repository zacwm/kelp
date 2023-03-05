import React, { createContext, useReducer, useContext } from 'react';
import { RoomStatus } from '../types';

// Context value types.
interface RoomContextInterface {
  room: any;
  setRoom: (data: any) => void;
  status: RoomStatus | undefined;
  setStatus: (data: RoomStatus) => void;
  closingRoom: boolean,
  setClosingRoom: () => void;
  eventLog: any[];
  setEventLog: (data: any) => void;
}

// Original context state values.
const RoomState: RoomContextInterface = {
  room: undefined,
  setRoom: () => undefined,
  status: undefined,
  setStatus: () => undefined,
  closingRoom: false,
  setClosingRoom: () => undefined,
  eventLog: [],
  setEventLog: () => undefined,
};

const Reducer = (state, action) => {
  if (action.type === 'reset') {
    return RoomState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const RoomContext: any = createContext<RoomContextInterface | null>(RoomState);

export const RoomProvider: any = (props: any) => {
  const [state, dispatch] = useReducer(Reducer, RoomState);

  // Context state functions
  state.setRoom = (data: any) => {
    dispatch({ type: 'room', value: data });
  };

  state.setStatus = (data: RoomStatus) => {
    dispatch({ type: 'status', value: data });
  };

  state.setClosingRoom = () => {
    dispatch({ type: 'closingRoom', value: true });
  };

  state.setEventLog = (data: any) => {
    dispatch({ type: 'eventLog', value: data });
  };
  
  return (
    <RoomContext.Provider value={{ ...state }}>
      { props.children }
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext<RoomContextInterface>(RoomContext);