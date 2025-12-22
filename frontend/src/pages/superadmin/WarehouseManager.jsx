import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "sonner";

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
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Warehouses</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Name</label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Warehouse Name"
                required
              />
           </div>
           
           <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Capacity</label>
              <input
                type="number"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Storage Capacity"
                required
              />
           </div>

           <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Contact Number</label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                value={formData.contactNumber || ""}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="+91..."
                required
              />
           </div>

           <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Address</label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address line"
                required
              />
           </div>

           <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Latitude</label>
                  <input
                    type="number" step="any"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="Lat"
                    required
                  />
              </div>
              <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Longitude</label>
                  <input
                    type="number" step="any"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="Lng"
                    required
                  />
              </div>
           </div>

           <div className="md:col-span-2">
              <button className="w-full h-12 bg-[#003049] hover:bg-[#002133] text-white font-semibold rounded-xl shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-0.5 active:translate-y-0">
                Create Warehouse
              </button>
           </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
             <h3 className="font-bold text-gray-800">Existing Warehouses</h3>
        </div>
        
        {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Capacity</th>
                   <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {warehouses.map((wh) => (
                  <tr key={wh._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{wh.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{wh.address || wh.location?.address}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                        {wh.location?.lat}, {wh.location?.lng}
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-50 text-purple-700">
                             {wh.capacity?.toLocaleString()}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{wh.contactNumber}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(wh._id)} 
                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                 {warehouses.length === 0 && (
                     <tr>
                         <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                             No warehouses found.
                         </td>
                     </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
