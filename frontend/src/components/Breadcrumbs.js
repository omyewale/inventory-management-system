import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import BreadcrumbsMui from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

const breadcrumbNameMap = {
  "/products": "Products",
  "/products/new": "Add Product",
  "/customers": "Customers",
  "/orders": "Orders",
  "/orders/new": "Create Order",
  "/dashboard": "Dashboard",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // If we are at the dashboard/root, we don't necessarily need extensive breadcrumbs
  if (location.pathname === "/" || location.pathname === "/dashboard") {
    return null;
  }

  return (
    <BreadcrumbsMui
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ marginBottom: 3 }}
    >
      <Link
        component={RouterLink}
        underline="hover"
        color="inherit"
        to="/dashboard"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
        Dashboard
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        // Match generic pathnames and format IDs
        let name = breadcrumbNameMap[to];
        if (!name) {
          // If it's a number/id
          if (!isNaN(value)) {
            name = `Details (#${value})`;
          } else {
            name = value.charAt(0).toUpperCase() + value.slice(1);
          }
        }

        return last ? (
          <Typography color="text.primary" key={to} sx={{ fontWeight: 500 }}>
            {name}
          </Typography>
        ) : (
          <Link component={RouterLink} underline="hover" color="inherit" to={to} key={to}>
            {name}
          </Link>
        );
      })}
    </BreadcrumbsMui>
  );
};

export default Breadcrumbs;
