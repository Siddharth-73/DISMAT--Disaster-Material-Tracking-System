import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <h1>Admin Dashboard</h1>
          </ProtectedRoute>
        }
      />

      {/* ADD OTHER ROLE DASHBOARDS LATER */}
      {/* /warehouse */}
      {/* /ngo */}
      {/* /fieldworker */}

    </Routes>
  </BrowserRouter>
);
