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
      paper: "rgba(19,22,41,0.88)",
    },
    text: {
      primary: "#f5f0e8",
      secondary: "#9aa0bc",
    },
    divider: "#252a45",
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: 'var(--font-body, "Lato", "Helvetica Neue", sans-serif)',
    h1: { fontWeight: 900 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
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
          background: "var(--card-background)",
          border: "1px solid #252a45",
          boxShadow: "var(--shadow-soft)",
          backdropFilter: "blur(6px)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "var(--card-background)",
          border: "1px solid #252a45",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: "1rem",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #e8197d 0%, #b5105e 100%)",
          boxShadow: "var(--glow-pink)",
          "&:hover": {
            background: "linear-gradient(135deg, #ff4fa3 0%, #e8197d 100%)",
          },
        },
        outlined: {
          borderColor: "rgba(245, 197, 24, 0.55)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            background: "rgba(12,14,26,0.45)",
            borderRadius: 12,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "var(--surface-glass)",
          backdropFilter: "blur(10px)",
          borderLeft: "1px solid #252a45",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 999,
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
