import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";

// Icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";

import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { FormSkeleton } from "../components/LoadingSkeleton";

const CreateOrder = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1, stock: 0, price: 0, name: "" }]);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        // Load all customers and products (without pagination limit, or with limit 100 for autocomplete selection)
        const custRes = await api.getCustomers({ limit: 100 });
        const prodRes = await api.getProducts({ limit: 100 });
        setCustomers(custRes.data.items);
        setProducts(prodRes.data.items);
      } catch (err) {
        showError(err);
      } finally {
        setLoading(false);
      }
    };
    loadFormData();
  }, [showError]);

  const handleAddRow = () => {
    setItems([...items, { product_id: "", quantity: 1, stock: 0, price: 0, name: "" }]);
  };

  const handleRemoveRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated.length ? updated : [{ product_id: "", quantity: 1, stock: 0, price: 0, name: "" }]);
  };

  const handleProductChange = (index, productId) => {
    const selectedProd = products.find((p) => p.id === productId);
    const updated = [...items];
    
    if (selectedProd) {
      updated[index] = {
        product_id: productId,
        quantity: 1,
        stock: selectedProd.quantity,
        price: Number(selectedProd.price),
        name: selectedProd.name,
      };
    } else {
      updated[index] = { product_id: "", quantity: 1, stock: 0, price: 0, name: "" };
    }
    setItems(updated);
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...items];
    const qty = parseInt(value, 10) || 0;
    updated[index].quantity = qty;
    setItems(updated);
  };

  // Computations
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!customerId) {
      showError("Please select a customer for the order.");
      return;
    }

    const validItems = items.filter((item) => item.product_id);
    if (validItems.length === 0) {
      showError("Please select at least one product.");
      return;
    }

    // Verify duplicate products
    const productIds = validItems.map((item) => item.product_id);
    if (new Set(productIds).size !== productIds.length) {
      showError("Duplicate products detected. Please consolidate item quantities into a single row.");
      return;
    }

    // Verify stock availability
    for (const item of validItems) {
      if (item.quantity <= 0) {
        showError(`Quantity for product '${item.name}' must be greater than zero.`);
        return;
      }
      if (item.quantity > item.stock) {
        showError(`Cannot order quantity of ${item.quantity} for '${item.name}'. Only ${item.stock} in stock.`);
        return;
      }
    }

    try {
      const payload = {
        customer_id: customerId,
        items: validItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };
      
      const response = await api.createOrder(payload);
      showSuccess(`Order #${response.data.id} successfully created!`);
      navigate(`/orders/${response.data.id}`);
    } catch (err) {
      showError(err);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <Box sx={{ mt: 1 }}>
      {/* Return header */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/orders")} variant="text" color="inherit">
          Back to Orders
        </Button>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", mb: 3 }}>
        Create Sales Invoice
      </Typography>

      <Grid container spacing={4}>
        {/* Main form details */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Select Customer & Products
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={8}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => option ? `${option.full_name} (${option.email})` : ""}
                  value={customers.find((c) => c.id === customerId) || null}
                  onChange={(event, newValue) => {
                    setCustomerId(newValue ? newValue.id : "");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Customer *" helperText="Assign order invoicing profile" />
                  )}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Items Catalog Selection
            </Typography>

            {/* Interactive rows */}
            {items.map((item, index) => (
              <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    options={products}
                    getOptionLabel={(option) => option ? `${option.name} (SKU: ${option.sku})` : ""}
                    value={products.find((p) => p.id === item.product_id) || null}
                    onChange={(event, newValue) => {
                      handleProductChange(index, newValue ? newValue.id : "");
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Choose Product" size="small" />
                    )}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Price"
                    value={item.price > 0 ? `$${item.price.toFixed(2)}` : "-"}
                    disabled
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    inputProps={{ min: 1, max: item.stock || 1 }}
                    disabled={!item.product_id}
                    fullWidth
                    size="small"
                    error={item.quantity > item.stock}
                  />
                </Grid>
                <Grid item xs={10} sm={2}>
                  <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right" }}>
                    Subtotal: ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={2} sm={1} sx={{ textAlign: "center" }}>
                  <IconButton color="error" onClick={() => handleRemoveRow(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
                {item.product_id && (
                  <Grid item xs={12} sx={{ pt: "0 !important", mt: -0.5, pl: "16px !important" }}>
                    <Typography variant="caption" color={item.stock === 0 ? "error" : item.stock <= 10 ? "warning.main" : "text.secondary"}>
                      Warehouse Inventory Status: <strong>{item.stock} items remaining</strong>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ))}

            <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddRow} sx={{ mt: 2 }}>
              Add Product Line Item
            </Button>
          </Card>
        </Grid>

        {/* Invoice Summary Details */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 4, borderRadius: 3, position: "sticky", top: 100 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <ShoppingBasketIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Checkout Summary
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Line Items:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {items.filter((item) => item.product_id).length} units
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total Bill:</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                  ${totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleSubmitOrder}
              disabled={totalAmount === 0}
            >
              Submit & Print Invoice
            </Button>

            {items.some((item) => item.quantity > item.stock) && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                Insufficient warehouse quantities for selected line items. Adjust order quantities before checking out.
              </Alert>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateOrder;
