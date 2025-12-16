import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/axios";

const FieldWorkerDashboard = () => {
  const { user, logout, data, fetchDashboardData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Form State for Delivery Confirmation
  const [deliveryForm, setDeliveryForm] = useState({
    dispatchId: "",
    peopleHelped: "",
    proofImage: null,
    signature: null
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter Dispatches for Field Worker
  // Assuming 'assignedTo' might match user ID, or we filter by status "in_transit" / "awaiting_fieldworker"
  // Since we don't have robust assignment logic in Create Dispatch (it just takes string driverName), 
  // we will display ALL dispatches that are 'in_transit' or 'awaiting_fieldworker' as potential assignments
  // OR if the driverName matches the user name.
  // Best bet: Filter Status = 'in_transit' OR 'awaiting_fieldworker'
  const activeDispatches = data.dispatches.filter(d => 
    d.status === 'in_transit' || d.status === 'awaiting_fieldworker'
  );

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

  return (<>
    {/* FIXED TOP BAR */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          zIndex: 1000,
        }}
      >
        {/* LEFT: LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#003049",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            D
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", color: "#003049" }}>DISMAT</span>
        </div>

        {/* RIGHT: USER + LOGOUT */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontWeight: "500", color: "#003049" }}>{user?.name || user?.email}</span>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#003049",
              color: "white",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 bg-[#fdf0d5] min-h-screen mt-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 mt-10 text-[#003049]">
            Field Worker Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Manage assigned dispatches and confirm deliveries
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
            <button onClick={() => setMessage({ text: "", type: "" })} className="float-right font-bold">&times;</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Assigned Dispatches Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: "#003049" }}>
                  Assigned Dispatches
                </h2>
                <p className="text-gray-600 text-sm">Active routes needing delivery</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#003049" }}
              >
                <span className="text-white text-2xl">🚚</span>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto border border-gray-100 space-y-3">
              {activeDispatches.length === 0 ? (
                 <p className="text-gray-500 font-medium text-center mt-10">No active dispatches found.</p>
              ) : (
                activeDispatches.map(d => (
                  <div key={d._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                     <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-[#003049]">#{d._id.slice(-6).toUpperCase()}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-bold">{d.status}</span>
                     </div>
                     <p className="text-sm text-gray-700"><strong>Destination:</strong> {d.destinationRegion}</p>
                     <p className="text-sm text-gray-700"><strong>Vehicle:</strong> {d.vehicleNo}</p>
                     <div className="mt-2 text-xs text-gray-500">
                        {d.items.map((i, idx) => (
                          <span key={idx} className="mr-2">{i.materialName}: {i.quantity}</span>
                        ))}
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Confirm Delivery Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: "#003049" }}>
                  Confirm Delivery
                </h2>
                <p className="text-gray-600 text-sm">Submit delivery proof</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#003049" }}
              >
                <span className="text-white text-2xl">✅</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleConfirmDelivery}>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                  Select Dispatch to Confirm
                </label>
                <select 
                  value={deliveryForm.dispatchId}
                  onChange={e => setDeliveryForm({ ...deliveryForm, dispatchId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white" 
                  style={{ "--tw-ring-color": "#003049" }}
                >
                  <option value="">-- Select Active Dispatch --</option>
                  {activeDispatches.map(d => (
                    <option key={d._id} value={d._id}>
                       #{d._id.slice(-6).toUpperCase()} - {d.destinationRegion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                  People Helped
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={deliveryForm.peopleHelped}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, peopleHelped: e.target.value })}
                  placeholder="Number of beneficiaries"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ "--tw-ring-color": "#003049" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                  Proof (Photo)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "proofImage")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white"
                  style={{ "--tw-ring-color": "#003049" }}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: "#003049" }}
                >
                  {loading ? "Confirming..." : "Confirm Delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>

          {/* Delivery History Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: "#003049" }}>
                  Delivery History
                </h2>
                <p className="text-gray-600 text-sm">Past completed deliveries</p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#003049" }}
              >
                <span className="text-white text-2xl">📋</span>
              </div>
            </div>
            
            <div className="overflow-x-auto min-h-[100px] border-t border-gray-100 pt-4">
              {deliveryHistory.length === 0 ? (
                  <p className="text-gray-500 font-medium text-center py-4">No completed deliveries yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                     <tr className="text-left text-gray-500 text-sm">
                        <th className="pb-2">Dispatch ID</th>
                        <th className="pb-2">Destination</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Completed At</th>
                     </tr>
                  </thead>
                  <tbody>
                     {deliveryHistory.map(d => (
                       <tr key={d._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="py-3 font-medium text-gray-700">#{d._id.slice(-6).toUpperCase()}</td>
                          <td className="py-3 text-gray-600">{d.destinationRegion}</td>
                          <td className="py-3">
                             <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs uppercase">Delivered</span>
                          </td>
                          <td className="py-3 text-gray-500 text-sm">{new Date(d.updatedAt).toLocaleDateString()}</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
      </div></>
  );
};

export default FieldWorkerDashboard;
