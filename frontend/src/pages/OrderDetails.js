import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
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
import ReceiptIcon from "@mui/icons-material/Receipt";
import DeleteIcon from "@mui/icons-material/Delete";

import { api } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { FormSkeleton } from "../components/LoadingSkeleton";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.getOrder(id);
      setOrder(response.data);
    } catch (err) {
      showError(err);
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteOrder(id);
      showSuccess(`Order #${id} deleted successfully and items returned to catalog.`);
      setDeleteOpen(false);
      navigate("/orders");
    } catch (err) {
      showError(err);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <Box sx={{ mt: 1 }}>
      {/* Return headers */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/orders")} variant="text" color="inherit">
          Back to Orders
        </Button>
        <Button startIcon={<DeleteIcon />} variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
          Delete & Restock Order
        </Button>
      </Box>

      {/* Invoice Overview Card */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Summary card */}
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <ReceiptIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Invoice Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Order Number:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>#{order.id}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Order Date:</Typography>
                  <Typography variant="body2">{new Date(order.created_at).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Order Status:</Typography>
                  <Chip
                    label={order.status}
                    color={order.status === "Completed" ? "success" : order.status === "Cancelled" ? "error" : "warning"}
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Invoice Total:</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                    ${Number(order.total_amount).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Customer Details */}
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Customer Profile
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body2">{order.customer_email}</Typography>
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Invoice Item Table */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, fontFamily: "'Outfit', sans-serif" }}>
              Ordered Items Ledger
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell>Product SKU</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="right">Qty Ordered</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Row Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontFamily: "monospace" }}>{item.sku}</TableCell>
                      <TableCell sx={{ fontWeight: 550 }}>{item.product_name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${Number(item.price).toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals row */}
                  <TableRow sx={{ bgcolor: "action.selected" }}>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 700 }}>
                      Grand Total:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: "primary.main" }}>
                      ${Number(order.total_amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteOpen}
        title="Delete Order & Restore Stock"
        message={`Are you sure you want to permanently delete order #${id}? Doing so will restore item stock levels in the warehouse catalog.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  );
};

export default OrderDetails;
