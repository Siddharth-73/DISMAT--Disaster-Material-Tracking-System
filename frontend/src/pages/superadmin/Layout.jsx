import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Layout({ children, activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      <div className="flex-1 ml-72 overflow-y-auto">
        <main className="p-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
