import React, { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const NotificationContext = createContext({
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info"); // success, error, warning, info

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const showNotification = useCallback((msg, sev) => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const showSuccess = useCallback((msg) => showNotification(msg, "success"), [showNotification]);
  const showError = useCallback((msg) => {
    // Standardize error extracts from Axios or string
    const text = msg?.response?.data?.detail || msg?.message || String(msg) || "An unexpected error occurred.";
    showNotification(text, "error");
  }, [showNotification]);
  const showWarning = useCallback((msg) => showNotification(msg, "warning"), [showNotification]);
  const showInfo = useCallback((msg) => showNotification(msg, "info"), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: "100%", borderRadius: 2 }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
