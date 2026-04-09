"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import MuiEmotionRegistry from "@/components/shared/MuiEmotionRegistry";

/** Mi Oaxaca — dark Día de los Muertos theme */
const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#e8197d", // brand pink (Mi Oaxaca logo)
      light: "#ff4fa3",
      dark: "#b5105e",
    },
    secondary: {
      main: "#f97316", // marigold orange
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f5c518", // gold/marigold
    },
    info: {
      main: "#06b6d4", // teal (folk-art birds)
    },
    success: {
      main: "#22c55e",
    },
    background: {
      default: "#0c0e1a", // deep dark navy — truck body
      paper: "#131629",
    },
    text: {
      primary: "#f5f0e8",
      secondary: "#9aa0bc",
    },
    divider: "#252a45",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Lato", "Helvetica Neue", sans-serif',
    h1: { fontWeight: 900 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #252a45",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: "linear-gradient(135deg, #e8197d 0%, #b5105e 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #ff4fa3 0%, #e8197d 100%)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default function MuiThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiEmotionRegistry>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </MuiEmotionRegistry>
  );
}
