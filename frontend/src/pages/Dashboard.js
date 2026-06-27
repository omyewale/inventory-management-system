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

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

// Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Icons
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { CardSkeleton } from "../components/LoadingSkeleton";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
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
      value: `₹${Number(stats?.total_revenue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <CurrencyRupeeIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      shadowColor: "rgba(16, 185, 129, 0.35)",
      trend: "+12.5%",
      trendLabel: "vs last month",
    },
    {
      title: "Total Orders",
      value: stats?.total_orders?.toLocaleString(),
      icon: <ReceiptIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
      shadowColor: "rgba(99, 102, 241, 0.35)",
      trend: "+8.2%",
      trendLabel: "vs last month",
    },
    {
      title: "Total Products",
      value: stats?.total_products?.toLocaleString(),
      icon: <InventoryIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
      shadowColor: "rgba(139, 92, 246, 0.35)",
      trend: "Active",
      trendLabel: "in catalog",
    },
    {
      title: "Total Customers",
      value: stats?.total_customers?.toLocaleString(),
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      shadowColor: "rgba(245, 158, 11, 0.35)",
      trend: "+3",
      trendLabel: "this week",
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

  const getAuditChipConfig = (changeType) => {
    switch (changeType) {
      case "CREATE": return { label: "CREATE", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" };
      case "RESTOCK": return { label: "RESTOCK", color: "#10b981", bg: "rgba(16,185,129,0.12)" };
      case "SALE": return { label: "SALE", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" };
      case "ADJUSTMENT": return { label: "ADJUST", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
      default: return { label: changeType, color: "#6b7280", bg: "rgba(107,114,128,0.12)" };
    }
  };

  const cardStyle = {
    borderRadius: 4,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: isDark
      ? "0 4px 20px rgba(0,0,0,0.3)"
      : "0 4px 20px rgba(0,0,0,0.06)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: isDark
        ? "0 8px 32px rgba(0,0,0,0.5)"
        : "0 8px 32px rgba(79,70,229,0.1)",
    },
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Page Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              background: isDark
                ? "linear-gradient(135deg, #e0e7ff, #c7d2fe)"
                : "linear-gradient(135deg, #1e1b4b, #4338ca)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Real-time operations metrics, inventory state, and revenue trackers.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartCheckoutIcon />}
            onClick={() => navigate("/orders/new")}
            sx={{
              borderRadius: 2.5,
              fontWeight: 700,
              px: 3,
              py: 1.2,
              boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
              "&:hover": { boxShadow: "0 6px 20px rgba(99,102,241,0.5)" },
            }}
          >
            Create Order
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate("/products")}
            sx={{ borderRadius: 2.5, fontWeight: 700, px: 3, py: 1.2 }}
          >
            Manage Stock
          </Button>
        </Box>
      </Box>

      {/* KPI Cards — premium gradient style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, idx) => (
          <Grid item xs={12} sm={6} lg={3} key={idx}>
            <Card
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: `0 8px 24px ${kpi.shadowColor}`,
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 16px 40px ${kpi.shadowColor}`,
                },
              }}
            >
              {/* Gradient background bar */}
              <Box
                sx={{
                  background: kpi.gradient,
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: 5,
                }}
              />
              <CardContent sx={{ p: 3, pt: 3.5 }}>
                {/* Icon + title row */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        color: "text.secondary",
                        fontSize: "0.7rem",
                      }}
                    >
                      {kpi.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        fontFamily: "'Outfit', sans-serif",
                        mt: 0.5,
                        lineHeight: 1.1,
                        background: kpi.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      background: kpi.gradient,
                      width: 52,
                      height: 52,
                      boxShadow: `0 4px 12px ${kpi.shadowColor}`,
                    }}
                  >
                    {kpi.icon}
                  </Avatar>
                </Box>
                {/* Trend badge */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      background: kpi.gradient,
                      borderRadius: 1.5,
                      px: 1,
                      py: 0.25,
                      display: "inline-flex",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#fff" }}>
                      {kpi.trend}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {kpi.trendLabel}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Low Stock Alert Banner */}
      {stats?.low_stock_count > 0 && (
        <Box
          sx={{
            mb: 4,
            p: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            background: isDark
              ? "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))"
              : "linear-gradient(135deg, rgba(255,251,235,1), rgba(254,243,199,1))",
            border: "1px solid rgba(245,158,11,0.35)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "#f59e0b", width: 38, height: 38 }}>
              <WarningAmberIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#92400e" }}>
                Low Stock Alert
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#b45309" }}>
                {stats.low_stock_count} product{stats.low_stock_count > 1 ? "s are" : " is"} running low on stock. Review immediately.
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
            onClick={() => navigate("/products?low_stock=true")}
            sx={{
              color: "#92400e",
              borderColor: "rgba(245,158,11,0.4)",
              fontWeight: 700,
              fontSize: "0.78rem",
              border: "1px solid",
              borderRadius: 2,
              px: 2,
            }}
          >
            View Low Stock
          </Button>
        </Box>
      )}

      {/* Chart + Activity */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Area Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ ...cardStyle, p: 0, overflow: "hidden" }}>
            <Box sx={{ p: 3, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ background: "linear-gradient(135deg,#6366f1,#4338ca)", width: 38, height: 38 }}>
                  <TrendingUpIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Revenue & Sales
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Last 7 Days</Typography>
                </Box>
              </Box>
              <Chip
                label="Live Data"
                size="small"
                sx={{
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: 24,
                }}
              />
            </Box>
            <Divider />
            <Box sx={{ px: 2, pb: 2, pt: 1, height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenue_chart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={0.7} />
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="date"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: "0.72rem" }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: "0.72rem" }}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 12,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      color: theme.palette.text.primary,
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={primaryColor}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={3}
                    dot={{ fill: primaryColor, r: 4, strokeWidth: 2, stroke: theme.palette.background.paper }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Recent Activity Feed */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ ...cardStyle, p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2.5, pb: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", width: 38, height: 38 }}>
                <HistoryIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  Recent Activities
                </Typography>
                <Typography variant="caption" color="text.secondary">Inventory & order events</Typography>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ flexGrow: 1, overflowY: "auto", maxHeight: 330, px: 1.5, py: 1 }}>
              {stats?.recent_activity?.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">No recent activities available.</Typography>
                </Box>
              ) : (
                <List dense disablePadding>
                  {stats?.recent_activity?.map((log, idx) => {
                    const chip = getAuditChipConfig(log.change_type);
                    return (
                      <ListItem
                        key={log.id}
                        alignItems="flex-start"
                        sx={{
                          py: 1.5,
                          px: 1,
                          borderRadius: 2,
                          mb: 0.5,
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Box
                          sx={{
                            mr: 1.5,
                            mt: 0.5,
                            minWidth: 60,
                            px: 1,
                            py: 0.3,
                            borderRadius: 1.5,
                            background: chip.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography sx={{ fontSize: "0.62rem", fontWeight: 800, color: chip.color, letterSpacing: 0.5 }}>
                            {chip.label}
                          </Typography>
                        </Box>
                        <ListItemText
                          primary={getAuditLogMessage(log)}
                          secondary={new Date(log.created_at).toLocaleString()}
                          primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: 600, lineHeight: 1.3 }}
                          secondaryTypographyProps={{ fontSize: "0.7rem", mt: 0.3 }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock + Recent Orders */}
      <Grid container spacing={3}>
        {/* Low Stock Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...cardStyle, p: 0, overflow: "hidden" }}>
            <Box sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", width: 38, height: 38 }}>
                  <WarningAmberIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Low Stock Warnings
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Products needing restock</Typography>
                </Box>
              </Box>
              {stats?.low_stock_count > 0 && (
                <Chip
                  label={`${stats.low_stock_count} items`}
                  size="small"
                  sx={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", fontWeight: 700, fontSize: "0.7rem" }}
                />
              )}
            </Box>
            <Divider />
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>SKU</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.low_stock_products?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        ✅ All products are sufficiently stocked!
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats?.low_stock_products?.map((prod) => (
                      <TableRow
                        key={prod.id}
                        hover
                        onClick={() => navigate(`/products/${prod.id}`)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{prod.name}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.78rem", color: "text.secondary" }}>{prod.sku}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${prod.quantity} left`}
                            color={prod.quantity === 0 ? "error" : "warning"}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
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
          <Card sx={{ ...cardStyle, p: 0, overflow: "hidden" }}>
            <Box sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ background: "linear-gradient(135deg,#6366f1,#4338ca)", width: 38, height: 38 }}>
                  <ReceiptIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Recent Orders
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Latest sales invoices</Typography>
                </Box>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: 11 }} />}
                onClick={() => navigate("/orders")}
                sx={{ fontSize: "0.75rem", fontWeight: 700 }}
              >
                View All
              </Button>
            </Box>
            <Divider />
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Order #</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Customer</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Amount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.recent_orders?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No orders recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats?.recent_orders?.map((ord) => (
                      <TableRow
                        key={ord.id}
                        hover
                        onClick={() => navigate(`/orders/${ord.id}`)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.82rem" }}>#{ord.id}</TableCell>
                        <TableCell sx={{ fontWeight: 500, fontSize: "0.82rem" }}>{ord.customer_name}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.85rem" }}>
                          ₹{Number(ord.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={ord.status}
                            size="small"
                            color={ord.status === "Completed" ? "success" : ord.status === "Cancelled" ? "error" : "warning"}
                            sx={{ fontWeight: 700, fontSize: "0.68rem" }}
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
      </Grid>
    </Box>
  );
};

export default Dashboard;
