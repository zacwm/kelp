import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    background: {
      default: '#121212',
    },
    text: {
      primary: '#fff',
    },

    primary: {
      main: '#19857b',
    },
  },
});

export default darkTheme;