import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Pagination from "@mui/material/Pagination";
import InputAdornment from "@mui/material/InputAdornment";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import FileOpenIcon from "@mui/icons-material/FileOpen";

import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { TableSkeleton } from "../components/LoadingSkeleton";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal Dialogs state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);

  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  // React Hook Form for new product creation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: "",
      quantity: 0,
    },
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.getProducts({
        page,
        limit,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        low_stock: lowStock || undefined,
      });
      setProducts(response.data.items);
      setTotal(response.data.total);
      setPages(response.data.pages);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortOrder, lowStock]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
    setPage(1);
  };

  const handleAddProductSubmit = async (data) => {
    try {
      await api.createProduct({
        ...data,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity, 10),
      });
      showSuccess("Product created successfully!");
      setOpenAddModal(false);
      reset();
      setPage(1);
      fetchProducts();
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteProductConfirm = async () => {
    try {
      await api.deleteProduct(deleteProductTarget.id);
      showSuccess(`Product '${deleteProductTarget.name}' deleted successfully.`);
      setDeleteProductTarget(null);
      fetchProducts();
    } catch (err) {
      showError(err);
      setDeleteProductTarget(null);
    }
  };

  const handleExportCSV = () => {
    window.open(api.getExportProductsUrl(), "_blank");
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Header section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            Product Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your corporate inventory, view stock, check status.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddModal(true)}>
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2, flexGrow: 1, maxWidth: 500, width: "100%" }}>
            <TextField
              size="small"
              placeholder="Search by SKU, name, or description..."
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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={lowStock}
                  onChange={(e) => {
                    setLowStock(e.target.checked);
                    setPage(1);
                  }}
                  color="warning"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 550 }}>
                  Show Low Stock Only (≤10)
                </Typography>
              }
            />
          </Box>
        </Box>
      </Card>

      {/* Table grid */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} aria-label="products table">
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "sku"}
                      direction={sortBy === "sku" ? sortOrder : "asc"}
                      onClick={() => handleSort("sku")}
                    >
                      SKU
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "name"}
                      direction={sortBy === "name" ? sortOrder : "asc"}
                      onClick={() => handleSort("name")}
                    >
                      Product Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === "price"}
                      direction={sortBy === "price" ? sortOrder : "asc"}
                      onClick={() => handleSort("price")}
                    >
                      Unit Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === "quantity"}
                      direction={sortBy === "quantity" ? sortOrder : "asc"}
                      onClick={() => handleSort("quantity")}
                    >
                      Quantity
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Stock Level</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <FileOpenIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No products found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((prod) => {
                    const isLowStock = prod.quantity <= 10;
                    const isOutOfStock = prod.quantity === 0;
                    return (
                      <TableRow key={prod.id} hover>
                        <TableCell sx={{ fontFamily: "monospace" }}>{prod.sku}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{prod.name}</TableCell>
                        <TableCell align="right">₹{Number(prod.price).toFixed(2)}</TableCell>
                        <TableCell align="right">{prod.quantity}</TableCell>
                        <TableCell align="center">
                          {isOutOfStock ? (
                            <Chip label="Out of Stock" color="error" size="small" sx={{ fontWeight: "bold" }} />
                          ) : isLowStock ? (
                            <Chip label="Low Stock" color="warning" size="small" sx={{ fontWeight: "bold" }} />
                          ) : (
                            <Chip label="In Stock" color="success" size="small" sx={{ fontWeight: "bold" }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/products/${prod.id}`)}
                            title="Edit / View Details"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => setDeleteProductTarget(prod)}
                            title="Delete Product"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
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

      {/* Add Product Modal Dialog */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Product</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handleAddProductSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Product Name *"
                  fullWidth
                  {...register("name", { required: "Name is required" })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="SKU (Unique Code) *"
                  fullWidth
                  {...register("sku", { required: "SKU is required", minLength: { value: 3, message: "Min length is 3" } })}
                  error={!!errors.sku}
                  helperText={errors.sku?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price (₹) *"
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  fullWidth
                  {...register("price", {
                    required: "Price is required",
                    validate: (v) => parseFloat(v) >= 0 || "Price cannot be negative",
                  })}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Quantity in Stock *"
                  type="number"
                  inputProps={{ min: "0" }}
                  fullWidth
                  {...register("quantity", {
                    required: "Quantity is required",
                    validate: (v) => parseInt(v, 10) >= 0 || "Quantity cannot be negative",
                  })}
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  multiline
                  rows={3}
                  fullWidth
                  {...register("description")}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpenAddModal(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create Product
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteProductTarget}
        title="Delete Product"
        message={`Are you sure you want to permanently delete '${deleteProductTarget?.name}'? This action cannot be undone and will fail if the product is linked to any historical order.`}
        onConfirm={handleDeleteProductConfirm}
        onCancel={() => setDeleteProductTarget(null)}
      />
    </Box>
  );
};

export default Products;
