import React, { createContext, useReducer, useContext } from 'react';

// Context value types.
interface RoomContextInterface {
  room: any;
  setRoom: (data: any) => void;
}

// Original context state values.
const RoomState: RoomContextInterface = {
  room: undefined,
  setRoom: () => undefined,
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
  
  return (
    <RoomContext.Provider value={{ ...state }}>
      { props.children }
    </RoomContext.Provider>
  );
};

export const useRoom = () => useContext<RoomContextInterface>(RoomContext);