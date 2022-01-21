import { createTheme } from '@material-ui/core';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Lato',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    button: {
      textTransform: 'none'
    }
  },
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      // main: '#de7d60',
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
      // contrastText: '#031927',
      light: '#5393ff',
      main: '#2979ff',
      dark: '#1c54b2',
      contrastText: '#fafafa'
    },
    secondary: {
      main: '#f1be3e',
    },

    background: {
      main: '#de7d60',
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.1,
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: "#FAFAFA",
          backgroundColor: "#1F2F3C",
          padding: "0.4em 1em"
        }
      }
    },
    MuiModal: {
      styleOverrides: {
        root: {
          // width: "600px",
          // backgroundColor: "#FAFAFA",
          display: "flex",
          alignItems: 'center',
          justifyContent: 'center'
        }
      }
    }
  }
});

// theme = responsiveFontSizes(theme);

export default theme;