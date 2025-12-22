import { useState } from "react";
import api from "../../api/axios";
import GlassCard from "../../components/ui/GlassCard";

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
      active: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      blocked: "bg-red-500/20 text-red-300 border border-red-500/30"
    };
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${colors[status] || "bg-slate-700 text-slate-300"}`}>
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
        const list = res.data.warehouses || res.data; 
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
    <GlassCard className="overflow-hidden animate-fadeIn relative p-0">
      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-white">User Directory</h2>
            <span className="text-sm text-slate-400">{filteredUsers.length} Users Found</span>
        </div>
        <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-slate-500 w-full md:w-64 text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Assigned</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(u => (
              <tr key={u._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{u.name}</div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">
                    {u.role}
                  </span>
                </td>
                {/* Assigned Warehouses Count */}
                <td className="px-6 py-4 text-sm text-slate-400">
                    {u.role === 'warehouse' ? (
                       <span className="font-mono bg-white/10 px-2 py-1 rounded text-white">
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
                         className="text-blue-400 hover:text-blue-300 text-sm font-bold mr-2 transition-colors"
                         title="Assign Warehouses"
                        >
                            🏭 Assign
                        </button>
                    )}

                    <select
                        onChange={(e) => changeRole(u._id, e.target.value)}
                        value={u.role} 
                        className="bg-black/40 border border-white/20 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1 px-2"
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
                        className="text-red-400 hover:text-red-300 font-bold text-sm transition-colors py-1 px-3 rounded hover:bg-red-500/10"
                    >
                      Block
                    </button>
                  ) : (
                    <button 
                        onClick={() => unblock(u._id)} 
                        className="text-emerald-400 hover:text-emerald-300 font-bold text-sm transition-colors py-1 px-3 rounded hover:bg-emerald-500/10"
                    >
                      Unblock
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                        No users found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ASSIGN WAREHOUSE MODAL */}
      {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <GlassCard className="max-w-lg w-full p-0 overflow-hidden animate-scaleIn">
                  <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 border-b border-white/10">
                      <h3 className="text-xl font-bold text-white">Assign Warehouses</h3>
                      <p className="text-blue-200 text-sm">Select warehouses for {selectedUser?.name}</p>
                  </div>
                  <div className="p-6">
                     <p className="mb-4 text-sm text-slate-400">Check the warehouses this user should manage:</p>
                     
                     <div className="max-h-60 overflow-y-auto space-y-2 mb-6 border border-white/10 rounded-lg p-2 bg-black/20 custom-scrollbar">
                         {warehouses.length === 0 ? (
                             <div className="text-center text-slate-500 py-4">No warehouses found.</div>
                         ) : (
                             warehouses.map(w => (
                                 <label key={w._id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded cursor-pointer transition-colors border border-transparent hover:border-white/5">
                                     <input 
                                       type="checkbox" 
                                       checked={assignedWarehouses.includes(w._id)}
                                       onChange={() => toggleWarehouse(w._id)}
                                       className="w-5 h-5 rounded border-white/30 text-blue-600 focus:ring-blue-500 bg-black/40"
                                     />
                                     <div>
                                         <div className="font-bold text-white">{w.name}</div>
                                         <div className="text-xs text-slate-500">Lat: {w.location?.lat?.toFixed(2)}, Lng: {w.location?.lng?.toFixed(2)}</div>
                                     </div>
                                 </label>
                             ))
                         )}
                     </div>

                     <div className="flex justify-end gap-3">
                         <button 
                           onClick={() => setShowAssignModal(false)}
                           className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                         >
                             Cancel
                         </button>
                         <button 
                           onClick={handleAssignSave}
                           className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                         >
                             Save Assignments
                         </button>
                     </div>
                  </div>
              </GlassCard>
          </div>
      )}

    </GlassCard>
  );
}
