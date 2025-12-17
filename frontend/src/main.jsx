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
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

import "./utils/fixLeafletIcons";
import "leaflet/dist/leaflet.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
