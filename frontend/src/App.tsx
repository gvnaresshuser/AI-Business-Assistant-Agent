import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import Unauthorized from "./pages/auth/Unauthorized";
import Dashboard from "./pages/dashboard/Dashboard";

import DashboardLayout from "./layouts/DashboardLayout";
import Agent from "./pages/agent/Agent";
import Knowledge from "./pages/knowledge/Knowledge";

// Products
import Products from "./pages/products/Products";
import ProductDetails from "./pages/products/ProductDetails";
import CreateProduct from "./pages/products/CreateProduct";
import EditProduct from "./pages/products/EditProduct";

// Customers
import Customers from "./pages/customers/Customers";
import CustomerDetails from "./pages/customers/CustomerDetails";
import CreateCustomer from "./pages/customers/CreateCustomer";
import EditCustomer from "./pages/customers/EditCustomer";

import Sales from "./pages/sales/Sales";
import Analytics from "./pages/analytics/Analytics";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/knowledge" element={<Knowledge />} />

            {/* Products */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/create" element={<CreateProduct />} />
            <Route path="/products/:id/edit" element={<EditProduct />} />
            <Route path="/products/:id" element={<ProductDetails />} />

            {/* Customers */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/create" element={<CreateCustomer />} />
            <Route path="/customers/:id/edit" element={<EditCustomer />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />

            {/* Sales */}
            <Route path="/sales" element={<Sales />} />

            {/* Analytics */}
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
