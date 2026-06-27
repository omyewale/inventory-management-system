import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";

// Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Icons
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";

import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { CardSkeleton } from "../components/LoadingSkeleton";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();
  const navigate = useNavigate();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getDashboardStats();
        setStats(response.data);
      } catch (err) {
        showError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showError]);

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Dashboard</Typography>
        <CardSkeleton />
      </Box>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${Number(stats?.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <AttachMoneyIcon sx={{ fontSize: 32 }} />,
      color: "#10b981", // Green
      bg: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "Total Orders",
      value: stats?.total_orders,
      icon: <ReceiptIcon sx={{ fontSize: 32 }} />,
      color: "#3b82f6", // Blue
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Total Products",
      value: stats?.total_products,
      icon: <InventoryIcon sx={{ fontSize: 32 }} />,
      color: "#8b5cf6", // Purple
      bg: "rgba(139, 92, 246, 0.1)",
    },
    {
      title: "Total Customers",
      value: stats?.total_customers,
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      color: "#f59e0b", // Yellow/Orange
      bg: "rgba(245, 158, 11, 0.1)",
    },
  ];

  const getAuditLogMessage = (log) => {
    const qty = Math.abs(log.quantity_changed);
    switch (log.change_type) {
      case "CREATE":
        return `Initialized product ${log.product_name} with ${qty} items`;
      case "RESTOCK":
        return `Restocked ${qty} units of ${log.product_name}`;
      case "SALE":
        return `Sold ${qty} units of ${log.product_name} (${log.reference_id})`;
      case "ADJUSTMENT":
        return `Adjusted stock for ${log.product_name} by ${log.quantity_changed} units`;
      default:
        return `${log.change_type} change for ${log.product_name}`;
    }
  };

  const getAuditLogColor = (changeType) => {
    switch (changeType) {
      case "CREATE":
        return "info";
      case "RESTOCK":
        return "success";
      case "SALE":
        return "primary";
      case "ADJUSTMENT":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Page Title with Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time operations metrics, inventory state, and revenue trackers.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartCheckoutIcon />}
            onClick={() => navigate("/orders/new")}
          >
            Create Order
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate("/products")}
          >
            Manage Stock
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                display: "flex",
                alignItems: "center",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: (theme) => theme.palette.mode === "dark"
                    ? "0 20px 40px -15px rgba(0,0,0,0.8)"
                    : "0 20px 40px -15px rgba(79, 70, 229, 0.12)",
                },
                cursor: "pointer",
              }}
            >
              <CardContent sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, fontFamily: "'Outfit', sans-serif" }}>
                    {kpi.value}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: kpi.bg,
                    color: kpi.color,
                    width: 56,
                    height: 56,
                  }}
                >
                  {kpi.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Low Stock Banner Alert */}
      {stats?.low_stock_count > 0 && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{ mb: 4, borderRadius: 2, display: "flex", alignItems: "center" }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/products?low_stock=true")}>
              View Low Stock Products
            </Button>
          }
        >
          <strong>Warning:</strong> You have {stats.low_stock_count} products running low on stock. Please review inventory immediately.
        </Alert>
      )}

      {/* Charts and Activity Logs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Area Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Revenue & Sales (Last 7 Days)
              </Typography>
            </Box>
            <Box sx={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={stats?.revenue_chart}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="date" stroke={theme.palette.text.secondary} style={{ fontSize: "0.75rem" }} />
                  <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: "0.75rem" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                      color: theme.palette.text.primary,
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={primaryColor}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Audit Trails */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Activities
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: "auto", maxHeight: 320, p: 1 }}>
              {stats?.recent_activity?.length === 0 ? (
                <Box sx={{ p: 4, text: "center" }}>
                  <Typography variant="body2" color="text.secondary">No recent activities available.</Typography>
                </Box>
              ) : (
                <List dense>
                  {stats?.recent_activity?.map((log) => (
                    <ListItem key={log.id} sx={{ alignItems: "flex-start", py: 1.5 }}>
                      <ListItemAvatar sx={{ minWidth: 48 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "transparent" }}>
                          <Chip
                            label={log.change_type}
                            color={getAuditLogColor(log.change_type)}
                            size="small"
                            sx={{ fontSize: "0.65rem", fontWeight: "bold" }}
                          />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={getAuditLogMessage(log)}
                        secondary={new Date(log.created_at).toLocaleString()}
                        primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 550 }}
                        secondaryTypographyProps={{ fontSize: "0.75rem" }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock & Recent Orders */}
      <Grid container spacing={3}>
        {/* Low Stock Products */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Low Stock Warnings
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Qty Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.low_stock_products?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        All products are sufficiently stocked!
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats?.low_stock_products?.map((prod) => (
                      <TableRow key={prod.id} hover onClick={() => navigate(`/products/${prod.id}`)} sx={{ cursor: "pointer" }}>
                        <TableCell sx={{ fontWeight: 500 }}>{prod.name}</TableCell>
                        <TableCell>{prod.sku}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={prod.quantity}
                            color={prod.quantity === 0 ? "error" : "warning"}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Recent Orders
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.recent_orders?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        No orders recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats?.recent_orders?.map((ord) => (
                      <TableRow key={ord.id} hover onClick={() => navigate(`/orders/${ord.id}`)} sx={{ cursor: "pointer" }}>
                        <TableCell sx={{ fontWeight: 500 }}>#{ord.id}</TableCell>
                        <TableCell>{ord.customer_name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          ${Number(ord.total_amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
