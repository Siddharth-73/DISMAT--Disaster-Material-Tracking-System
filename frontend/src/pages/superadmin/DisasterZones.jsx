import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import GlassCard from "../../components/ui/GlassCard";
import LiveDisasterMap from "../../components/LiveDisasterMap";

export default function DisasterZones() {
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    severity: "moderate",
    description: "",
    geometryType: "circle",
    lat: 20.5937,
    lng: 78.9629,
    radiusKm: 50,
  });

  const fetchZones = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/disaster-zones"); // Get all (SuperAdmin)
      setZones(data);
    } catch (error) {
      console.error("Fetch zones error", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/disaster-categories");
      setCategories(data);
    } catch (error) {
      console.error("Fetch categories error", error);
    }
  };

  useEffect(() => {
    fetchZones();
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        severity: formData.severity,
        description: formData.description,
        geometryType: formData.geometryType,
        source: "manual",
        center: { lat: Number(formData.lat), lng: Number(formData.lng) },
        radiusKm: Number(formData.radiusKm)
      };

      if (editingZone) {
        await api.patch(`/disaster-zones/${editingZone._id}`, payload);
        toast.success("Zone updated");
      } else {
        await api.post("/disaster-zones", payload);
        toast.success("Zone created");
      }
      
      setFormData({
        name: "", category: "", severity: "moderate", description: "",
        geometryType: "circle", lat: 20.5937, lng: 78.9629, radiusKm: 50
      });
      setEditingZone(null);
      fetchZones();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving zone");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this disaster zone?")) return;
    try {
      await api.delete(`/disaster-zones/${id}`);
      toast.success("Zone deleted");
      fetchZones();
    } catch (error) {
      toast.error("Error deleting zone");
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      category: zone.category._id || zone.category,
      severity: zone.severity || "moderate",
      description: zone.description || "",
      geometryType: zone.geometryType || "circle",
      lat: zone.center?.lat || 20.5937,
      lng: zone.center?.lng || 78.9629,
      radiusKm: zone.radiusKm || 50
    });
  };

  const handleCancel = () => {
    setEditingZone(null);
    setFormData({
      name: "", category: "", severity: "moderate", description: "",
      geometryType: "circle", lat: 20.5937, lng: 78.9629, radiusKm: 50
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Live Map Section */}
      <GlassCard className="p-1 overflow-hidden">
         <div className="h-[400px] w-full rounded-xl overflow-hidden relative">
            <LiveDisasterMap />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border border-white/10 z-[1000]">
                <h3 className="font-bold text-white text-sm">Live Monitoring</h3>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">● Real-time Updates</p>
            </div>
         </div>
      </GlassCard>

      {/* Form Section */}
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-bl-full -z-0 pointer-events-none"></div>
        <h3 className="font-bold text-white mb-6 relative z-10 text-lg">
            {editingZone ? "Edit Disaster Zone" : "Manual Zone Entry"}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Zone Name</label>
            <input
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none text-white placeholder-slate-500"
              placeholder="e.g. North Kashmir Flood Plain"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Category</label>
            <select
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none appearance-none text-white"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="" className="bg-slate-900">Select Category</option>
              {categories.map(c => <option key={c._id} value={c._id} className="bg-slate-900">{c.name}</option>)}
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Severity Level</label>
             <div className="grid grid-cols-4 gap-2">
                {[
                    { val: "low", label: "Low", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
                    { val: "moderate", label: "Mod", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
                    { val: "severe", label: "High", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
                    { val: "extreme", label: "Crit", color: "bg-red-500/20 text-red-300 border-red-500/30" }
                ].map((opt) => (
                    <button
                        key={opt.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, severity: opt.val })}
                        className={`py-2.5 rounded-lg border text-sm font-bold transition-all ${
                            formData.severity === opt.val 
                            ? `${opt.color} ring-2 ring-offset-2 ring-offset-slate-900 ring-white/10 shadow-lg` 
                            : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">Description</label>
            <input
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none text-white placeholder-slate-500"
              placeholder="Brief details..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
             <label className="block text-xs font-bold text-blue-300 mb-3 uppercase tracking-wide flex items-center gap-2">
                Geolocation Data
                <span className="text-[10px] normal-case bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">Decimal degrees</span>
            </label>
             <div className="flex gap-4">
                <input
                    type="number" step="0.0001"
                    className="w-full px-4 py-2.5 bg-black/30 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-sm font-mono text-white placeholder-blue-300/50"
                    placeholder="Latitude"
                    value={formData.lat}
                    onChange={e => setFormData({ ...formData, lat: e.target.value })}
                    required
                />
                <input
                    type="number" step="0.0001"
                    className="w-full px-4 py-2.5 bg-black/30 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-sm font-mono text-white placeholder-blue-300/50"
                    placeholder="Longitude"
                    value={formData.lng}
                    onChange={e => setFormData({ ...formData, lng: e.target.value })}
                    required
                />
                <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-black/30 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-sm font-mono text-white placeholder-blue-300/50"
                    placeholder="Radius (km)"
                    value={formData.radiusKm}
                    onChange={e => setFormData({ ...formData, radiusKm: e.target.value })}
                    required
                />
             </div>
          </div>

          <div className="md:col-span-2 pt-2 flex gap-3">
            <button type="submit" className="flex-1 h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
              {editingZone ? "Update Zone Configuration" : "Initialize New Zone"}
            </button>
            {editingZone && (
              <button type="button" onClick={handleCancel} className="px-6 h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
      </GlassCard>

      {/* List */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
             <h3 className="font-bold text-white">Active Zones</h3>
             <span className="text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full">{zones.length} Zones</span>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-xs text-slate-400 uppercase tracking-wider font-bold border-b border-white/10">
                  <th className="px-6 py-4">Zone Details</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Coordinates</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {zones.map(z => (
                  <tr key={z._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-bold text-white">{z.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {z.category?.name || "Uncategorized"}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                          z.severity === "extreme" ? "bg-red-500/20 text-red-300 border-red-500/30" :
                          z.severity === "severe" ? "bg-orange-500/20 text-orange-300 border-orange-500/30" :
                          z.severity === "moderate" ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}>
                          {z.severity}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        <div>{z.center?.lat.toFixed(4)}, {z.center?.lng.toFixed(4)}</div>
                        <div className="text-slate-500">R: {z.radiusKm}km</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${z.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
                        {z.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(z)} className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(z._id)} className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
                {zones.length === 0 && (
                     <tr>
                         <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                             No zones configured. Use the map or form to add one.
                         </td>
                     </tr>
                )}
              </tbody>
            </table>
        </div>
      </GlassCard>
    </div>
  );
}
