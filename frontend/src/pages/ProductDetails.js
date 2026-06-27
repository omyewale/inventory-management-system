import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";

import { api, API_BASE_URL } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { FormSkeleton } from "../components/LoadingSkeleton";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [product, setProduct] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const loadData = async () => {
    try {
      const prodRes = await api.getProduct(id);
      const auditRes = await api.getProductAuditLogs(id); // Wait, we need to implement this in API service first! Let's check api.js
      setProduct(prodRes.data);
      setAuditLogs(auditRes.data);

      // Populate form
      setValue("name", prodRes.data.name);
      setValue("sku", prodRes.data.sku);
      setValue("price", prodRes.data.price);
      setValue("quantity", prodRes.data.quantity);
      setValue("description", prodRes.data.description || "");
    } catch (err) {
      showError(err);
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateProduct = async (data) => {
    try {
      const updated = await api.updateProduct(id, {
        ...data,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity, 10),
      });
      showSuccess("Product details updated successfully!");
      setProduct(updated.data);
      loadData(); // Reload logs
    } catch (err) {
      showError(err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const response = await api.uploadProductImage(id, selectedFile);
      showSuccess("Product image uploaded successfully!");
      setProduct(response.data);
      setSelectedFile(null);
    } catch (err) {
      showError(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  const imageUrl = product?.image_url
    ? `${API_BASE_URL}${product.image_url}`
    : null;

  return (
    <Box sx={{ mt: 1 }}>
      {/* Action Header */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/products")} variant="text" color="inherit">
          Back to Catalog
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Left Side: General Info & Image Upload */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Product Image Card */}
            <Card sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Product Media
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 220,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px dashed",
                  borderColor: "divider",
                  mb: 2,
                }}
              >
                {imageUrl ? (
                  <Box component="img" src={imageUrl} alt={product.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Box sx={{ textAlign: "center", color: "text.secondary" }}>
                    <ImageIcon sx={{ fontSize: 56, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">No Image Uploaded</Typography>
                  </Box>
                )}
              </Box>

              {/* Upload controls */}
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <Button component="label" variant="outlined" size="small" startIcon={<UploadFileIcon />}>
                  Choose File
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {selectedFile && (
                  <Button
                    variant="contained"
                    size="small"
                    color="secondary"
                    onClick={handleImageUpload}
                    disabled={uploading}
                    startIcon={<CloudUploadIcon />}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </Stack>
              {selectedFile && (
                <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Card>

            {/* Quick Summary Card */}
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Stock Status
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    SKU Code:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                    {product.sku}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Level:
                  </Typography>
                  <Chip
                    label={`${product.quantity} units`}
                    color={product.quantity === 0 ? "error" : product.quantity <= 10 ? "warning" : "success"}
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Value:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ₹{(Number(product.price) * product.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Right Side: Edit Form & Inventory Log */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Edit details form */}
            <Card sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, fontFamily: "'Outfit', sans-serif" }}>
                Modify Product Specifications
              </Typography>
              <Box component="form" onSubmit={handleSubmit(handleUpdateProduct)}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Product Name"
                      fullWidth
                      {...register("name", { required: "Name is required" })}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="SKU Code"
                      fullWidth
                      {...register("sku", { required: "SKU is required" })}
                      error={!!errors.sku}
                      helperText={errors.sku?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Unit Price (₹)"
                      type="number"
                      inputProps={{ step: "0.01", min: "0" }}
                      fullWidth
                      {...register("price", {
                        required: "Price is required",
                        validate: (v) => parseFloat(v) >= 0 || "Price cannot be negative",
                      })}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Available Inventory Quantity"
                      type="number"
                      inputProps={{ min: "0" }}
                      fullWidth
                      {...register("quantity", {
                        required: "Quantity is required",
                        validate: (v) => parseInt(v, 10) >= 0 || "Quantity cannot be negative",
                      })}
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Product Description"
                      multiline
                      rows={3}
                      fullWidth
                      {...register("description")}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <Button type="submit" variant="contained" color="primary">
                    Save Specifications
                  </Button>
                </Box>
              </Box>
            </Card>

            {/* Inventory History (Audit Log) */}
            <Card sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Inventory Audit History
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "action.hover" }}>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Change Type</TableCell>
                      <TableCell align="right">Qty Adjusted</TableCell>
                      <TableCell align="right">New Stock Level</TableCell>
                      <TableCell>Reference Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          No inventory audit logs found for this product.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log) => {
                        const isPositive = log.quantity_changed > 0;
                        return (
                          <TableRow key={log.id} hover>
                            <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={log.change_type}
                                size="small"
                                color={
                                  log.change_type === "RESTOCK"
                                    ? "success"
                                    : log.change_type === "SALE"
                                    ? "primary"
                                    : log.change_type === "CREATE"
                                    ? "info"
                                    : "warning"
                                }
                                sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold", color: isPositive ? "success.main" : "error.main" }}>
                              {isPositive ? `+${log.quantity_changed}` : log.quantity_changed}
                            </TableCell>
                            <TableCell align="right">{log.new_quantity}</TableCell>
                            <TableCell>{log.reference_id || "N/A"}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetails;
