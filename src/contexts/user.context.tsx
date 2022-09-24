import React, { createContext, useReducer, useContext } from 'react';

// Context value types.
interface UserContextInterface {
  user: any;
  setUser: (data: any) => void;
}

// Original context state values.
const UserState: UserContextInterface = {
  user: {},
  setUser: () => undefined,
};

const Reducer = (state, action) => {
  if (action.type === 'reset') {
    return UserState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const UserContext: any = createContext<UserContextInterface | null>(UserState);

export const UserProvider: any = (props: any) => {
  const [state, dispatch] = useReducer(Reducer, UserState);

  // Context state functions
  state.setUser = (data: any) => {
    dispatch({ type: 'user', value: data });
  };
  
  return (
    <UserContext.Provider value={{ ...state }}>
      { props.children }
    </UserContext.Provider>
  );
};

export const useUser = () => useContext<UserContextInterface>(UserContext);