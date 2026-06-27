import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";

// Icons
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { TableSkeleton } from "../components/LoadingSkeleton";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getOrders({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setOrders(response.data.items);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteOrder(deleteTarget.id);
      showSuccess(`Order #${deleteTarget.id} successfully deleted and items restocked.`);
      setDeleteTarget(null);
      fetchOrders();
    } catch (err) {
      showError(err);
      setDeleteTarget(null);
    }
  };

  const handleExportCSV = () => {
    window.open(api.getExportOrdersUrl(), "_blank");
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Header Panel */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            Sales Orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process invoices, monitor history, export receipts.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/orders/new")}>
            New Order
          </Button>
        </Box>
      </Box>

      {/* Filter and Search Card */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2, flexGrow: 1, maxWidth: 500, width: "100%" }}>
            <TextField
              size="small"
              placeholder="Search by customer name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained">
              Search
            </Button>
          </Box>
          <Box sx={{ minWidth: 160 }}>
            <TextField
              select
              size="small"
              label="Order Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              fullWidth
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Box>
        </Box>
      </Card>

      {/* Table view */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "id"}
                      direction={sortBy === "id" ? sortOrder : "asc"}
                      onClick={() => handleSort("id")}
                    >
                      Order ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "customer_name"}
                      direction={sortBy === "customer_name" ? sortOrder : "asc"}
                      onClick={() => handleSort("customer_name")}
                    >
                      Customer
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === "total_amount"}
                      direction={sortBy === "total_amount" ? sortOrder : "asc"}
                      onClick={() => handleSort("total_amount")}
                    >
                      Total Amount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "created_at"}
                      direction={sortBy === "created_at" ? sortOrder : "asc"}
                      onClick={() => handleSort("created_at")}
                    >
                      Order Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <ReceiptLongIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No orders recorded yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((ord) => (
                    <TableRow key={ord.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>#{ord.id}</TableCell>
                      <TableCell>{ord.customer_name}</TableCell>
                      <TableCell>{ord.customer_email}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        ${Number(ord.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{new Date(ord.created_at).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={ord.status}
                          color={ord.status === "Completed" ? "success" : ord.status === "Cancelled" ? "error" : "warning"}
                          size="small"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" size="small" onClick={() => navigate(`/orders/${ord.id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => setDeleteTarget(ord)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Pagination
                count={pages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete & Restock Order"
        message={`Are you sure you want to permanently delete Order #${deleteTarget?.id}? This will restore the stock levels of the ordered products in the warehouse catalog.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default Orders;
