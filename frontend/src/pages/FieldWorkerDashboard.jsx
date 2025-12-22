import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";
import GlassCard from "../components/ui/GlassCard";

const FieldWorkerDashboard = () => {
  const { user, data, fetchDashboardData } = useAuth(); // Removed logout as it's in layout
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Form State for Delivery Confirmation
  const [deliveryForm, setDeliveryForm] = useState({
    dispatchId: "",
    peopleHelped: "",
    proofImage: null,
    signature: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Filter Dispatches for Field Worker
  const activeDispatches = data.dispatches.filter(d => {
    const s = (d.status || '').toLowerCase();
    return s === 'in_transit' || s === 'awaiting_fieldworker' || s === 'pending' || s === 'packed'; 
  });

  const deliveryHistory = data.dispatches.filter(d => d.status === 'completed');

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setDeliveryForm({ ...deliveryForm, [field]: e.target.files[0] });
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryForm.dispatchId || !deliveryForm.peopleHelped) {
      setMessage({ text: "Please select a dispatch and enter people helped.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      // POST /delivery/confirm with FormData
      const formData = new FormData();
      formData.append("dispatchId", deliveryForm.dispatchId);
      formData.append("peopleHelped", deliveryForm.peopleHelped);
      if (deliveryForm.proofImage) formData.append("proofImage", deliveryForm.proofImage);
      if (deliveryForm.signature) formData.append("signature", deliveryForm.signature);

      await api.post("/delivery/confirm", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage({ text: "Delivery confirmed successfully!", type: "success" });
      setDeliveryForm({ dispatchId: "", peopleHelped: "", proofImage: null, signature: null });
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || "Failed to confirm delivery", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-[#003049] dark:text-white">
            Field Worker Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage assigned dispatches and confirm deliveries
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
            {message.text}
            <button onClick={() => setMessage({ text: "", type: "" })} className="float-right font-bold">&times;</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Assigned Dispatches Section */}
          <GlassCard className="p-6 flex flex-col h-[500px]" delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-white">
                  Assigned Dispatches
                </h2>
                <p className="text-slate-400 text-sm">Active routes needing delivery</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600/20 text-blue-400 border border-blue-500/30"
              >
                <span className="text-2xl">🚚</span>
              </div>
            </div>
            
            <div className="flex-1 bg-black/20 rounded-lg p-4 overflow-y-auto border border-white/5 space-y-3 custom-scrollbar">
              {activeDispatches.length === 0 ? (
                 <p className="text-slate-500 font-medium text-center mt-10">No active dispatches found.</p>
              ) : (
                activeDispatches.map(d => (
                  <div key={d._id} className="bg-white/5 p-4 rounded-lg shadow-sm border border-white/10 hover:bg-white/10 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white">#{d._id.slice(-6).toUpperCase()}</span>
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2 py-1 rounded-full uppercase font-bold">{d.status}</span>
                     </div>
                     <p className="text-sm text-slate-300"><strong>Destination:</strong> {d.destinationRegion}</p>
                     <p className="text-sm text-slate-300"><strong>Vehicle:</strong> {d.vehicleNo}</p>
                     <div className="mt-2 text-xs text-slate-400">
                        {d.items.map((i, idx) => (
                          <span key={idx} className="mr-2 px-2 py-1 bg-white/5 rounded border border-white/5 inline-block mb-1">{i.materialName}: {i.quantity}</span>
                        ))}
                     </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Confirm Delivery Section */}
          <GlassCard className="p-6 h-[500px]" delay={0.2}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-white">
                  Confirm Delivery
                </h2>
                <p className="text-slate-400 text-sm">Submit delivery proof</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
              >
                <span className="text-2xl">✅</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleConfirmDelivery}>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Select Dispatch to Confirm
                </label>
                <select 
                  value={deliveryForm.dispatchId}
                  onChange={e => setDeliveryForm({ ...deliveryForm, dispatchId: e.target.value })}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-black/20 text-white transition-all" 
                >
                  <option value="" className="bg-slate-800">-- Select Active Dispatch --</option>
                  {activeDispatches.map(d => (
                    <option key={d._id} value={d._id} className="bg-slate-800">
                       #{d._id.slice(-6).toUpperCase()} - {d.destinationRegion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  People Helped
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={deliveryForm.peopleHelped}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, peopleHelped: e.target.value })}
                  placeholder="Number of beneficiaries"
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all bg-black/20 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Proof (Photo)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "proofImage")}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 transition-all bg-black/20 text-white file:bg-blue-600 file:border-none file:rounded-md file:text-white file:px-2 file:py-1 file:mr-4 file:text-sm hover:file:bg-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500"
                >
                  {loading ? "Confirming..." : "Confirm Delivery"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

          {/* Delivery History Section */}
          <GlassCard className="p-6 md:col-span-2" delay={0.3}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-white">
                  Delivery History
                </h2>
                <p className="text-slate-400 text-sm">Past completed deliveries</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-600/20 text-purple-400 border border-purple-500/30"
              >
                <span className="text-2xl">📋</span>
              </div>
            </div>
            
            <div className="overflow-x-auto min-h-[100px] border-t border-white/10 pt-4">
              {deliveryHistory.length === 0 ? (
                  <p className="text-slate-500 font-medium text-center py-4">No completed deliveries yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                     <tr className="text-left text-slate-400 text-sm">
                        <th className="pb-2">Dispatch ID</th>
                        <th className="pb-2">Destination</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Completed At</th>
                     </tr>
                  </thead>
                  <tbody>
                     {deliveryHistory.map(d => (
                       <tr key={d._id} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-medium text-slate-300">#{d._id.slice(-6).toUpperCase()}</td>
                          <td className="py-3 text-slate-400">{d.destinationRegion}</td>
                          <td className="py-3">
                             <span className="bg-green-500/20 text-green-300 border border-green-500/30 font-bold px-2 py-1 rounded text-xs uppercase">Delivered</span>
                          </td>
                          <td className="py-3 text-slate-500 text-sm">{new Date(d.updatedAt).toLocaleDateString()}</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>
    </DashboardLayout>
  );
};

export default FieldWorkerDashboard;
