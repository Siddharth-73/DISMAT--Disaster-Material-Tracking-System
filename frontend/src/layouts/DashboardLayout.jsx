import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  // Sidebar links based on role
  const menu = {
    admin: [
      { name: "Dashboard", path: "/admin" },
      { name: "Requests", path: "/admin/requests" },
      { name: "Dispatches", path: "/admin/dispatches" },
      { name: "Emergency Reports", path: "/admin/emergency" },
      { name: "Users", path: "/admin/users" }
    ],
    warehouse: [
      { name: "Dashboard", path: "/warehouse" },
      { name: "Stock", path: "/warehouse/stock" },
      { name: "Approved Requests", path: "/warehouse/requests" },
      { name: "Create Dispatch", path: "/warehouse/dispatch" },
      { name: "Dispatch List", path: "/warehouse/dispatch/list" }
    ],
    ngo: [
      { name: "Dashboard", path: "/ngo" },
      { name: "Create Request", path: "/ngo/request" },
      { name: "My Requests", path: "/ngo/requests" }
    ],
    fieldworker: [
      { name: "Dashboard", path: "/fieldworker" },
      { name: "Assigned Dispatches", path: "/fieldworker/dispatches" }
    ]
  };

  const links = menu[user.role] || [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          Relief System
        </h2>

        <nav className="flex-1 space-y-3">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-2 rounded-md hover:bg-blue-100"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
