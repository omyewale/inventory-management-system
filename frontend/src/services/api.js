import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  // Products
  getProducts: (params) => apiClient.get("/products", { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  getProductAuditLogs: (id) => apiClient.get(`/products/${id}/audit`),
  createProduct: (data) => apiClient.post("/products", data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
  uploadProductImage: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/products/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getExportProductsUrl: () => `${API_BASE_URL}/api/products/export/csv`,

  // Customers
  getCustomers: (params) => apiClient.get("/customers", { params }),
  getCustomer: (id) => apiClient.get(`/customers/${id}`),
  createCustomer: (data) => apiClient.post("/customers", data),
  deleteCustomer: (id) => apiClient.delete(`/customers/${id}`),

  // Orders
  getOrders: (params) => apiClient.get("/orders", { params }),
  getOrder: (id) => apiClient.get(`/orders/${id}`),
  createOrder: (data) => apiClient.post("/orders", data),
  deleteOrder: (id) => apiClient.delete(`/orders/${id}`),
  getExportOrdersUrl: () => `${API_BASE_URL}/api/orders/export/csv`,

  // Dashboard
  getDashboardStats: () => apiClient.get("/dashboard"),
};

export default apiClient;
export { API_BASE_URL };
