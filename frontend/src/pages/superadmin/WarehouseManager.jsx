import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import GlassCard from "../../components/ui/GlassCard";

export default function WarehouseManager() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lat: "",
    lng: "",
    capacity: ""
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/warehouses");
      setWarehouses(data);
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        capacity: Number(formData.capacity)
      };

      if (editingId) {
        await api.patch(`/warehouses/${editingId}`, payload);
        toast.success("Warehouse updated");
      } else {
        await api.post("/warehouses", {
          ...payload,
           address: payload.location?.address || payload.address
        });
        toast.success("Warehouse created");
      }

      setFormData({ name: "", address: "", lat: "", lng: "", capacity: "" });
      setEditingId(null);
      fetchWarehouses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving warehouse");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
        await api.delete(`/warehouses/${id}`);
        fetchWarehouses();
        toast.success("Warehouse deleted");
    } catch(e) { 
        toast.error("Failed to delete"); 
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Create Section */}
       <GlassCard className="p-6 overflow-hidden relative">
        <h2 className="text-xl font-bold text-white mb-6">Manage Warehouses</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Name</label>
              <input
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-white placeholder-slate-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Warehouse Name"
                required
              />
           </div>
           
           <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Capacity</label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-white placeholder-slate-500"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Storage Capacity"
                required
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Contact Number</label>
              <input
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-white placeholder-slate-500"
                value={formData.contactNumber || ""}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="+91..."
                required
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Address</label>
              <input
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-white placeholder-slate-500"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address line"
                required
              />
           </div>

           <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Latitude</label>
                  <input
                    type="number" step="any"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-white placeholder-slate-500"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="Lat"
                    required
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Longitude</label>
                  <input
                    type="number" step="any"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-white placeholder-slate-500"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="Lng"
                    required
                  />
              </div>
           </div>

           <div className="md:col-span-2">
              <button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                Create Warehouse
              </button>
           </div>
        </form>
      </GlassCard>

      {/* List */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
             <h3 className="font-bold text-white">Existing Warehouses</h3>
        </div>
        
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-xs text-slate-400 uppercase tracking-wider font-bold border-b border-white/10">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Capacity</th>
                   <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {warehouses.map((wh) => (
                  <tr key={wh._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-semibold text-white">{wh.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{wh.address || wh.location?.address}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {wh.location?.lat}, {wh.location?.lng}
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                             {wh.capacity?.toLocaleString()}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{wh.contactNumber}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(wh._id)} 
                        className="text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                 {warehouses.length === 0 && (
                     <tr>
                         <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                             No warehouses found.
                         </td>
                     </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
