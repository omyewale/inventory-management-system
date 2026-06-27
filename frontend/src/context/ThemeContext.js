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
            main: darkMode ? "#818cf8" : "#4f46e5", // Vibrant modern indigo
            light: darkMode ? "#a5b4fc" : "#818cf8",
            dark: darkMode ? "#4f46e5" : "#3730a3",
          },
          secondary: {
            main: "#10b981", // Emerald green
          },
          background: {
            default: darkMode ? "#070d19" : "#f8fafc", // Space dark vs slate-50
            paper: darkMode ? "#0f172a" : "#ffffff", // Navy slate vs white
          },
          text: {
            primary: darkMode ? "#f8fafc" : "#0f172a",
            secondary: darkMode ? "#94a3b8" : "#64748b",
          },
        },
        typography: {
          fontFamily: "'Inter', 'Outfit', sans-serif",
          h1: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            letterSpacing: "-1px",
          },
          h2: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          },
          h3: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          },
          h4: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          },
          h5: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
          },
          h6: {
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.2px",
          },
        },
        shape: {
          borderRadius: 16, // Smoother curved edges
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
                padding: "10px 20px",
                boxShadow: "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-1.5px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                boxShadow: darkMode
                  ? "0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 1px 1px rgba(255,255,255,0.05) inset"
                  : "0 10px 30px -10px rgba(79, 70, 229, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)",
                border: darkMode ? "1px solid #1e293b" : "1px solid #eef2f6",
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
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
