import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { ThemeModeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrder";
import OrderDetails from "./pages/OrderDetails";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeModeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Dashboard Layout Wrapper */}
            <Route path="/" element={<DashboardLayout />}>
              {/* Redirect root to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Product Routes */}
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetails />} />
              
              {/* Customer Routes */}
              <Route path="customers" element={<Customers />} />
              
              {/* Order Routes */}
              <Route path="orders" element={<Orders />} />
              <Route path="orders/new" element={<CreateOrder />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeModeProvider>
  );
}

export default App;
