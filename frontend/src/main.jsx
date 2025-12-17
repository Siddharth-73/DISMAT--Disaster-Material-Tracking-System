import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./utils/fixLeafletIcons";
import "leaflet/dist/leaflet.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import PendingApproval from "./pages/PendingApproval";

import AdminDashboard from "./pages/AdminDashboard";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import NGODashboard from "./pages/NGODashboard";
import FieldWorkerDashboard from "./pages/FieldWorkerDashboard";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pending" element={<PendingApproval />} />

          {/* Protected */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute role="superadmin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse"
            element={
              <ProtectedRoute role="warehouse">
                <WarehouseDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ngo"
            element={
              <ProtectedRoute role="ngo">
                <NGODashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/fieldworker"
            element={
              <ProtectedRoute role="fieldworker">
                <FieldWorkerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);