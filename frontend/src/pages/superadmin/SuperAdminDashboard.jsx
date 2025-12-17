import { useEffect, useState } from "react";
import api from "../../api/axios";
import SuperAdminStats from "./SuperAdminStats";
import PendingUsers from "./PendingUsers";
import UsersTable from "./UsersTable";
import UserCharts from "./UserCharts";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchData = async () => {
    const allUsers = await api.get("/superadmin/users");
    const pending = await api.get("/superadmin/pending-users");

    setUsers(allUsers.data);
    setPendingUsers(pending.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">SuperAdmin Dashboard</h1>

      <SuperAdminStats users={users} pending={pendingUsers} />

      <UserCharts users={users} />

      <PendingUsers users={pendingUsers} refresh={fetchData} />

      <UsersTable users={users} refresh={fetchData} />
    </div>
  );
}
