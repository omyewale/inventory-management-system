import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Pagination from "@mui/material/Pagination";
import InputAdornment from "@mui/material/InputAdornment";

// Icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";

import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { TableSkeleton } from "../components/LoadingSkeleton";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { showSuccess, showError } = useNotification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
    },
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.getCustomers({
        page,
        limit,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setCustomers(response.data.items);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
    setPage(1);
  };

  const handleAddCustomer = async (data) => {
    try {
      await api.createCustomer(data);
      showSuccess("Customer added successfully!");
      setOpenAddModal(false);
      reset();
      setPage(1);
      fetchCustomers();
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteCustomer(deleteTarget.id);
      showSuccess(`Customer '${deleteTarget.full_name}' deleted successfully.`);
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      showError(err);
      setDeleteTarget(null);
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Action Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            Customer Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View profiles, contact information, and order relations.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddModal(true)}>
          Add Customer
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: "flex", gap: 2, maxWidth: 500 }}>
          <TextField
            size="small"
            placeholder="Search by name, email, phone..."
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
      </Card>

      {/* Grid List */}
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
                      active={sortBy === "full_name"}
                      direction={sortBy === "full_name" ? sortOrder : "asc"}
                      onClick={() => handleSort("full_name")}
                    >
                      Customer Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "email"}
                      direction={sortBy === "email" ? sortOrder : "asc"}
                      onClick={() => handleSort("email")}
                    >
                      Email Address
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "created_at"}
                      direction={sortBy === "created_at" ? sortOrder : "asc"}
                      onClick={() => handleSort("created_at")}
                    >
                      Joined Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <PersonIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No customers found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((cust) => (
                    <TableRow key={cust.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{cust.full_name}</TableCell>
                      <TableCell>{cust.email}</TableCell>
                      <TableCell>{cust.phone || "N/A"}</TableCell>
                      <TableCell>{new Date(cust.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <IconButton color="error" size="small" onClick={() => setDeleteTarget(cust)}>
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

      {/* Add Customer Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Customer</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handleAddCustomer)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name *"
                  fullWidth
                  {...register("full_name", { required: "Name is required" })}
                  error={!!errors.full_name}
                  helperText={errors.full_name?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email Address *"
                  fullWidth
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                      message: "Invalid email address format",
                    },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  placeholder="e.g. +15550199"
                  fullWidth
                  {...register("phone", {
                    validate: (v) => {
                      if (!v) return true;
                      const cleaned = v.replace(/[\s\-()]/g, "");
                      return /^\+?\d{7,15}$/.test(cleaned) || "Phone must be between 7 and 15 digits";
                    },
                  })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenAddModal(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Save Customer
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message={`Are you sure you want to permanently delete '${deleteTarget?.full_name}'? Doing so will cascade delete all orders linked to this customer.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default Customers;
