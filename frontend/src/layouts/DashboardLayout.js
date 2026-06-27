import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Container from "@mui/material/Container";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";

import { useThemeMode } from "../context/ThemeContext";
import Breadcrumbs from "../components/Breadcrumbs";

const drawerWidth = 260;

const DashboardLayout = () => {
  const { darkMode, toggleTheme } = useThemeMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Products", icon: <InventoryIcon />, path: "/products" },
    { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
    { text: "Orders", icon: <ReceiptIcon />, path: "/orders" },
  ];

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1, px: 2 }}>
        <PrecisionManufacturingIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "primary.main",
          }}
        >
          ApexInventory
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "primary.contrastText" : "text.secondary",
                  "&:hover": {
                    bgcolor: isActive ? "primary.dark" : "action.hover",
                    color: isActive ? "primary.contrastText" : "text.primary",
                  },
                  transition: "all 0.2s",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "inherit",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: "0.75rem" }}>
          © 2026 ApexInventory Ltd.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: "0.75rem", mt: 0.5 }}>
          v1.0.0 (Production)
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: "none",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, display: { xs: "none", sm: "block" } }}>
            Inventory Control Panel
          </Typography>

          <IconButton onClick={toggleTheme} color="inherit">
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <Toolbar /> {/* Spacer for Top Appbar */}
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Breadcrumbs />
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
