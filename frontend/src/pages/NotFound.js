import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
        py: 8,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "error.light",
          color: "error.contrastText",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 4,
          boxShadow: 3,
        }}
      >
        <QuestionMarkIcon sx={{ fontSize: 40 }} />
      </Box>

      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          fontFamily: "'Outfit', sans-serif",
          mb: 2,
        }}
      >
        404 Page Not Found
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ maxWidth: 450, mb: 4 }}
      >
        The page you are looking for does not exist, has been moved, or is temporarily unavailable. Check the URL or click the button below.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/dashboard")}
        size="large"
      >
        Return to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;
