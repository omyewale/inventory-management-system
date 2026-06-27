import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeModeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#1e3a8a", // Premium Navy Blue
            light: "#3b82f6",
            dark: "#1e3a8a",
          },
          secondary: {
            main: "#10b981", // Emerald green
          },
          background: {
            default: darkMode ? "#0f172a" : "#f8fafc", // slate-900 vs slate-50
            paper: darkMode ? "#1e293b" : "#ffffff", // slate-800 vs white
          },
          text: {
            primary: darkMode ? "#f1f5f9" : "#0f172a",
            secondary: darkMode ? "#94a3b8" : "#475569",
          },
        },
        typography: {
          fontFamily: "'Inter', 'Outfit', sans-serif",
          h1: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
          },
          h2: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
          },
          h3: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
          },
          h4: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
          },
          h5: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
          },
          h6: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 500,
          },
          button: {
            textTransform: "none",
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: "8px 16px",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-1px)",
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                boxShadow: darkMode
                  ? "0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)"
                  : "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeModeContext.Provider value={{ darkMode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
