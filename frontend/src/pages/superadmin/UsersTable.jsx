import { useState } from "react";
import api from "../../api/axios";

export default function UsersTable({ users, refresh }) {
  const block = async (id) => {
    if(!window.confirm("Are you sure you want to block this user?")) return;
    try {
        await api.patch(`/superadmin/block/${id}`);
        refresh();
    } catch(e) { console.error(e); }
  };

  const unblock = async (id) => {
    try {
        await api.patch(`/superadmin/unblock/${id}`);
        refresh();
    } catch(e) { console.error(e); }
  };

  const changeRole = async (id, role) => {
    try {
        await api.patch(`/superadmin/role/${id}`, { role });
        refresh();
    } catch(e) { console.error(e); }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      blocked: "bg-red-100 text-red-800"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  // Assign Warehouse Logic
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [assignedWarehouses, setAssignedWarehouses] = useState([]);

  const openAssignModal = async (user) => {
    setSelectedUser(user);
    setAssignedWarehouses(user.warehouses || []);
    
    try {
        const res = await api.get("/warehouses");
        const list = res.data.warehouses || res.data; // adjust based on API response structure
        setWarehouses(Array.isArray(list) ? list : []);
    } catch(e) { console.error("Fetch warehouses failed", e); }
    
    setShowAssignModal(true);
  };

  const handleAssignSave = async () => {
      try {
          await api.patch(`/superadmin/assign-warehouses/${selectedUser._id}`, {
              warehouses: assignedWarehouses
          });
          setShowAssignModal(false);
          refresh();
      } catch(e) { 
          alert("Failed to assign warehouses");
          console.error(e); 
      }
  };

  const toggleWarehouse = (id) => {
      if (assignedWarehouses.includes(id)) {
          setAssignedWarehouses(assignedWarehouses.filter(wId => wId !== id));
      } else {
          setAssignedWarehouses([...assignedWarehouses, id]);
      }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn relative">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-800">User Directory</h2>
            <span className="text-sm text-gray-500">{filteredUsers.length} Users Found</span>
        </div>
        <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(u => (
              <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{u.name}</div>
                </td>
                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700 capitalize">
                    {u.role}
                  </span>
                </td>
                {/* Assigned Warehouses Count */}
                <td className="px-6 py-4 text-sm text-gray-500">
                    {u.role === 'warehouse' ? (
                       <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                           {(u.warehouses && u.warehouses.length) || 0}
                       </span>
                    ) : '-'}
                </td>
                <td className="px-6 py-4">
                    <StatusBadge status={u.status} />
                </td>
                <td className="px-6 py-4 text-right space-x-3 flex items-center justify-end">
                    {/* Assign Button for Warehouse Role */}
                    {u.role === 'warehouse' && (
                        <button 
                         onClick={() => openAssignModal(u)}
                         className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold mr-2"
                         title="Assign Warehouses"
                        >
                            🏭 Assign
                        </button>
                    )}

                    <select
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        value={u.role} 
                        className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1"
                    >
                      <option value="admin">Admin</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="ngo">NGO</option>
                      <option value="fieldworker">Fieldworker</option>
                      <option value="public">Public</option>
                      <option value="superadmin">Superadmin</option>
                    </select>

                  {u.status === "active" ? (
                    <button 
                        onClick={() => block(u._id)} 
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                    >
                      Block
                    </button>
                  ) : (
                    <button 
                        onClick={() => unblock(u._id)} 
                        className="text-green-500 hover:text-green-700 font-medium text-sm transition-colors"
                    >
                      Unblock
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No users found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ASSIGN WAREHOUSE MODAL */}
      {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn">
                  <div className="bg-[#003049] p-6 text-white">
                      <h3 className="text-xl font-bold">Assign Warehouses</h3>
                      <p className="text-blue-200 text-sm">Select warehouses for {selectedUser?.name}</p>
                  </div>
                  <div className="p-6">
                     <p className="mb-4 text-sm text-gray-600">Check the warehouses this user should manage:</p>
                     
                     <div className="max-h-60 overflow-y-auto space-y-2 mb-6 border rounded-lg p-2">
                         {warehouses.length === 0 ? (
                             <div className="text-center text-gray-400 py-4">No warehouses found. Create one first.</div>
                         ) : (
                             warehouses.map(w => (
                                 <label key={w._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                     <input 
                                       type="checkbox" 
                                       checked={assignedWarehouses.includes(w._id)}
                                       onChange={() => toggleWarehouse(w._id)}
                                       className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                     />
                                     <div>
                                         <div className="font-semibold text-gray-800">{w.name}</div>
                                         <div className="text-xs text-gray-500">{w.location?.lat?.toFixed(2)}, {w.location?.lng?.toFixed(2)}</div>
                                     </div>
                                 </label>
                             ))
                         )}
                     </div>

                     <div className="flex justify-end gap-3">
                         <button 
                           onClick={() => setShowAssignModal(false)}
                           className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                         >
                             Cancel
                         </button>
                         <button 
                           onClick={handleAssignSave}
                           className="px-6 py-2 bg-[#003049] text-white rounded-lg font-bold hover:bg-[#00416b]"
                         >
                             Save Assignments
                         </button>
                     </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
