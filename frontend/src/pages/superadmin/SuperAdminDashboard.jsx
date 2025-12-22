import { useEffect, useState } from "react";
import api from "../../api/axios";
import Layout from "./Layout";
import SuperAdminStats from "./SuperAdminStats";
import PendingUsers from "./PendingUsers";
import UsersTable from "./UsersTable";

import DisasterZones from "./DisasterZones";
import CategoryManager from "./CategoryManager";
import WarehouseManager from "./WarehouseManager";
import AnalyticsDashboard from "./AnalyticsDashboard";
import GlassCard from "../../components/ui/GlassCard";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("analytics");

  const fetchData = async () => {
    try {
      const allUsers = await api.get("/superadmin/users");
      const pending = await api.get("/superadmin/pending-users");
      setUsers(allUsers.data);
      setPendingUsers(pending.data);
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">System Analytics</h2>
            <AnalyticsDashboard />
            <SuperAdminStats counts={{
                users: users.length,
                pending: pendingUsers.length,
                requests: 0, // Not currently fetched here, could be added if needed
                warehouses: 0 // Not currently fetched here
            }} />
          </div>
        );
      case "users":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">User Management</h2>
            <UsersTable users={users} refresh={fetchData} />
          </div>
        );
      case "pending":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Pending Approvals</h2>
            <PendingUsers users={pendingUsers} refresh={fetchData} />
          </div>
        );

      case "zones":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Disaster Zones</h2>
            <DisasterZones />
          </div>
        );
      case "categories":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Category Management</h2>
            <CategoryManager />
          </div>
        );
      case "warehouse": // Changed from 'warehouses' to match Sidebar if needed, or check Sidebar link
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Warehouse Management</h2>
            <WarehouseManager />
          </div>
        );

      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
