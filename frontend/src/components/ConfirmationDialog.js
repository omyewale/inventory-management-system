import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";

const ConfirmationDialog = ({ open, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", severity = "error" }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      PaperProps={{
        sx: { borderRadius: 3, padding: 1 }
      }}
    >
      <DialogTitle id="confirmation-dialog-title" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WarningAmberIcon color={severity === "error" ? "error" : "warning"} />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ paddingRight: 3, paddingBottom: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={severity} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
