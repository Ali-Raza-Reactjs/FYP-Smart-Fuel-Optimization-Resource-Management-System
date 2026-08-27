import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#123C69",
      light: "#2B5D8D",
      dark: "#0B2948",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#AC3B61",
      light: "#C15B7D",
      dark: "#872D4B",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#EEE2DC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#123C69",
      secondary: "#6F6870",
      disabled: "#BAB2B5",
    },
    error: {
      main: "#B91C1C",
    },
    warning: {
      main: "#6F6870",
    },
    success: {
      main: "#166534",
    },
    divider: "#BAB2B5",
  },
  typography: {
    fontFamily:
      '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    h1: { fontSize: "2.35rem", fontWeight: 800, letterSpacing: "-0.04em" },
    h2: { fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.025em" },
    h4: { fontSize: "1.35rem", fontWeight: 700 },
    h5: { fontSize: "1.15rem", fontWeight: 700 },
    h6: { fontSize: "1rem", fontWeight: 700 },
    subtitle1: { fontSize: "1rem", fontWeight: 500 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
    body1: { fontSize: "1rem", fontWeight: 400 },
    body2: { fontSize: "0.875rem", fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          boxShadow: "none",
          padding: "9px 17px",
          transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 5px 12px rgba(18, 60, 105, 0.16)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(18, 60, 105, 0.07)",
          border: "1px solid #BAB2B5",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 10,
        },
        elevation1: {
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
        elevation2: {
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        elevation3: {
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: "#123C69",
          backgroundColor: "#E6D6D0",
          borderBottom: "2px solid #BAB2B5",
        },
        root: {
          borderBottom: "1px solid #D4C8C9",
          padding: "14px 16px",
          whiteSpace: "nowrap",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(18, 60, 105, 0.08)",
          transition: "box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#BAB2B5", borderWidth: 1.5 },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#AC3B61" },
          "&.Mui-focused": {
            backgroundColor: "#FFFFFF",
            boxShadow: "0 3px 12px rgba(172, 59, 97, 0.18), 0 0 0 3px rgba(172, 59, 97, 0.12)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#AC3B61", borderWidth: 2 },
          "&.Mui-error": { boxShadow: "0 2px 8px rgba(185, 28, 28, 0.12)" },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          padding: "0 5px",
          zIndex: 1,
          "&.Mui-focused": { color: "#AC3B61" },
          "&.Mui-error": { color: "#B91C1C" },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 14, boxShadow: "0 20px 50px rgba(18, 60, 105, 0.2)" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 7, fontWeight: 700 },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { overflowX: "auto", borderRadius: 0 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRadius: 0 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
  },
});

export default theme;
