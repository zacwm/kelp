import React, { createContext, useReducer, useContext } from 'react';

// Context value types.
interface VideoContextInterface {
  video: any;
  setVideo: (data: any) => void;
  subtitles: any;
  setSubtitles: (data: any) => void;
  selectedSubtitle: number;
  setSelectedSubtitle: (data: number) => void;
}

// Original context state values.
const VideoState: VideoContextInterface = {
  video: undefined,
  setVideo: () => undefined,
  subtitles: [],
  setSubtitles: () => undefined,
  selectedSubtitle: -1,
  setSelectedSubtitle: () => undefined,
};

const Reducer = (state, action) => {
  if (action.type === 'reset') {
    return VideoState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const VideoContext: any = createContext<VideoContextInterface | null>(VideoState);

export const VideoProvider: any = (props: any) => {
  const [state, dispatch] = useReducer(Reducer, VideoState);

  // Context state functions
  state.setVideo = (data: any) => {
    dispatch({ type: 'video', value: data });
  };

  state.setSubtitles = (data: any) => {
    dispatch({ type: 'subtitles', value: data });
  };

  state.setSelectedSubtitle = (data: number) => {
    dispatch({ type: 'selectedSubtitle', value: data });
  };
  
  return (
    <VideoContext.Provider value={{ ...state }}>
      { props.children }
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext<VideoContextInterface>(VideoContext);