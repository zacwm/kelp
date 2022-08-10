import React, { createContext, useState, useReducer, useContext } from 'react';

// Context value types.
interface VideoContextInterface {
  video: any;
  setVideo: (data: any) => void;
}

// Original context state values.
const VideoState: VideoContextInterface = {
  video: undefined,
  setVideo: (data: any) => {},
};

const Reducer = (state, action) => {
  if (action.type === "reset") {
    return VideoState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const VideoContext: any = createContext<VideoContextInterface | null>(VideoState);

export const VideoProvider: any = (props) => {
  const [state, dispatch] = useReducer(Reducer, VideoState);

  // Context state functions
  state.setVideo = (data: any) => {
    dispatch({ type: 'video', value: data });
  };
  
  return (
    <VideoContext.Provider value={{ ...state }}>
      { props.children }
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext<VideoContextInterface>(VideoContext);