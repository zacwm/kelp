import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',

    background: {
      default: '#121212',
    },
    text: {
      primary: '#ddd',
    },

    primary: {
      main: '#00a152',
    },
    error: {
      main: '#f44336',
    }
  },
});

export default darkTheme;