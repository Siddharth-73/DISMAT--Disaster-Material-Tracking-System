import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function WarehouseDashboard() {
  const { data, fetchDashboardData, loadingData } = useAuth();

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Forms State
  const [receiptForm, setReceiptForm] = useState({
    name: "",
    category: "Food",
    unit: "units",
    warehouse: "Central",
    quantity: "",
    source: "",
    remarks: "",
  });
  const [dispatchForm, setDispatchForm] = useState({
    requestId: "",
    warehouse: "Central",
    vehicleNo: "",
    driverName: "",
    driverPhone: "",
    destinationRegion: "",
    items: [],
    itemSelection: {}, // { materialName: qty } to fulfill request
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  // Initial Data Load
  useEffect(() => {
    fetchDashboardData();
  }, []); // fetch on mount

  // Handlers
  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/materials/receipt", receiptForm);
      setMessage({ text: "Material receipt added successfully", type: "success" });
      setShowReceiptModal(false);
      fetchDashboardData(); // Refresh data
      setReceiptForm({ name: "", category: "Food", unit: "units", warehouse: "Central", quantity: "", source: "", remarks: "" });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to add receipt", type: "error" });
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();

    if (!dispatchForm.requestId) return;

    const selectedRequest = data.requests.find((r) => r._id === dispatchForm.requestId);
    if (!selectedRequest) return;

    try {
       // Items structure: backend expects [{ materialName, quantity }] which is what existing request.items has.
      const payload = {
        requestId: dispatchForm.requestId,
        items: selectedRequest.items, // Fulfilling all items
        warehouse: dispatchForm.warehouse,
        vehicleNo: dispatchForm.vehicleNo,
        driverName: dispatchForm.driverName,
        driverPhone: dispatchForm.driverPhone,
        destinationRegion: selectedRequest.region, 
      };

      await api.post("/dispatch", payload);
      setMessage({ text: "Dispatch created successfully", type: "success" });
      setShowDispatchModal(false);
      fetchDashboardData();
      setDispatchForm({
        requestId: "",
        warehouse: "Central",
        vehicleNo: "",
        driverName: "",
        driverPhone: "",
        destinationRegion: "",
        items: [],
        itemSelection: {},
      });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to create dispatch", type: "error" });
    }
  };

  // Filter approved requests for Dispatch creation
  const approvedRequests = data.requests.filter((r) => r.status === "approved");

  return (
    <>
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

      <div className="min-h-screen bg-[#fdf0d5] border-b border-gray-200 mb-8">
        {/* Page Header */}
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 pt-10" style={{ color: "#003049" }}>
              Warehouse Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Manage incoming materials and outgoing dispatches</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-12">
          {/* Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
              <button onClick={() => setMessage({ text: "", type: "" })} className="float-right font-bold">
                &times;
              </button>
            </div>
          )}

          {/* Action Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Log Material Receipt Card */}
            <div id="log-receipt" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: "#003049", maxHeight: "100px", overflow: "hidden" }}>
                    Log Material Receipt
                  </h2>
                  <p className="text-gray-600">Record incoming materials from suppliers</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#003049" }}>
                  <span className="text-white text-2xl">📦</span>
                </div>
              </div>
              <button
                onClick={() => setShowReceiptModal(true)}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: "#003049" }}
              >
                Add Receipt
              </button>
            </div>

            {/* Stock Action Card (Used to be View Stock, now Add Stock shortcut or similar) */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: "#003049" }}>
                    Stock Management
                  </h2>
                  <p className="text-gray-600">Add new stock to inventory</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#003049" }}>
                  <span className="text-white text-2xl">📊</span>
                </div>
              </div>
              <button
                onClick={() => setShowReceiptModal(true)}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: "#003049" }}
              >
                Add Stock
              </button>
            </div>
          </div>

          {/* Logged Material Receipts */}
          <div
            id="receipt-list"
            className="bg-white rounded-xl shadow-lg p-6 md:col-span-2"
            style={{
              height: "320px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#003049" }}>
              Logged Material Receipts
            </h2>

            {data.receipts && data.receipts.length === 0 ? (
              <p className="text-gray-500">No receipts logged yet.</p>
            ) : (
              <div
                className="space-y-4"
                style={{
                  overflowY: "auto",
                  maxHeight: "220px",
                  paddingRight: "6px",
                }}
              >
                {data.receipts.map((r) => (
                  <div key={r._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center ">
                    <div>
                      <p className="font-semibold text-gray-800">{r.materialName || r.material || "Material"}</p>

                      <p className="text-sm text-gray-500">Quantity: {r.quantity || 0}</p>

                      <p className="text-xs text-gray-400">Source: {r.source || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Section (Visible on page for Sidebar Scroll) */}
          <div id="stock" className="bg-white rounded-xl shadow-lg p-6 mb-8 mt-8 scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#003049" }}>
              Current Stock Availability
            </h2>
            <div className="overflow-x-auto max-h-[400px]">
              {data.stock.length === 0 ? (
                <p className="text-gray-500">No stock recorded yet.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#003049" }}>
                      <th className="px-6 py-3 text-left text-white font-semibold">Material</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Category</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Available Quantity</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stock.map((item) => (
                      <tr key={item._id} className="border-b border-gray-200">
                        <td className="px-6 py-4 text-gray-700 font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600">{item.category}</td>
                        <td className="px-6 py-4 text-gray-700 text-lg">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{new Date(item.updatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

      {/* Pending Requests Section (View Only for Warehouse) */}
      <div id="pending-requests" className="mb-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-[#003049] mb-4">Pending Material Requests</h2>
        {data.requests.filter(r => r.status === 'pending').length === 0 ? (
           <div className="bg-white rounded-xl shadow-md p-6 text-center">
               <p className="text-gray-500">No pending requests.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.requests.filter(r => r.status === 'pending').map(req => (
                  <div key={req._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-400">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#003049] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {req.requester?.name?.substring(0, 2).toUpperCase() || "NG"}
                              </div>
                              <div>
                                  <h3 className="font-bold text-[#003049]">{req.requester?.name || "Unknown NGO"}</h3>
                                  <p className="text-xs text-gray-500">{req.region}</p>
                              </div>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                              Pending
                          </span>
                      </div>
                      
                      <div className="mb-6">
                          <p className="text-sm font-semibold text-gray-600 mb-2">Requested Items (Waiting Admin Approval):</p>
                          <div className="flex flex-wrap gap-2">
                              {req.items.map((i, idx) => (
                                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">
                                      {i.materialName}: {i.quantity}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
           </div>
        )}
      </div>

          {/* Approved NGO Requests Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#003049" }}>
              Approved NGO Requests (Ready for Dispatch)
            </h2>
            <p className="text-gray-600 mb-6">Create dispatch orders for approved requests</p>
            <div className="overflow-x-auto">
              {approvedRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No approved requests pending dispatch.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#003049" }}>
                      <th className="px-6 py-4 text-left text-white font-semibold">NGO / Region</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Items Requested</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedRequests.map((req) => (
                      <tr key={req._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-700">
                          <div className="font-semibold">{req.requester?.name || "Unknown NGO"}</div>
                          <div className="text-xs text-gray-500">{req.region}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {req.items.map((i, idx) => (
                            <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 mb-1">
                              {i.materialName}: {i.quantity}
                            </span>
                          ))}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setDispatchForm((prev) => ({ ...prev, requestId: req._id, destinationRegion: req.region }));
                              setShowDispatchModal(true);
                            }}
                            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: "#003049" }}
                          >
                            Create Dispatch
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Dispatch Tracking Section */}
          <div id="dispatch" className="bg-white rounded-xl shadow-lg p-6 scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#003049" }}>
              Dispatch Tracking
            </h2>
            <p className="text-gray-600 mb-6">Monitor status of outgoing dispatches</p>
            <div className="overflow-x-auto">
              {data.dispatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No dispatches found.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: "#003049" }}>
                      <th className="px-6 py-4 text-left text-white font-semibold">Dispatch ID</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Destination</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dispatches.map((disp) => (
                      <tr key={disp._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-700">#{disp._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-gray-700">{disp.destinationRegion}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold
                            ${disp.status === "completed" || disp.status === "Delivered" ? "bg-green-100 text-green-800" : disp.status === "in_transit" || disp.status === "In Transit" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {disp.status === 'completed' ? 'DELIVERED' : disp.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(disp.updatedAt).toLocaleDateString()} {new Date(disp.updatedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Material Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
              <button onClick={() => setShowReceiptModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-6" style={{ color: "#003049" }}>
                Log Material Receipt
              </h3>
              <form onSubmit={handleReceiptSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                    Material Name
                  </label>
                  <input
                    type="text"
                    required
                    value={receiptForm.name}
                    onChange={(e) => setReceiptForm({ ...receiptForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": "#003049" }}
                    placeholder="e.g. Water Bottles"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                      Category
                    </label>
                    <select
                      value={receiptForm.category}
                      onChange={(e) => setReceiptForm({ ...receiptForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": "#003049" }}
                    >
                      <option value="Food">Food</option>
                      <option value="Water">Water</option>
                      <option value="Medical">Medical</option>
                      <option value="Shelter">Shelter</option>
                      <option value="Clothing">Clothing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={receiptForm.quantity}
                      onChange={(e) => setReceiptForm({ ...receiptForm, quantity: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{ "--tw-ring-color": "#003049" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                    Source / Supplier
                  </label>
                  <input
                    type="text"
                    value={receiptForm.source}
                    onChange={(e) => setReceiptForm({ ...receiptForm, source: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": "#003049" }}
                    placeholder="e.g. ABC Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                    Remarks
                  </label>
                  <textarea
                    value={receiptForm.remarks}
                    onChange={(e) => setReceiptForm({ ...receiptForm, remarks: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": "#003049" }}
                    rows="2"
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-all hover:bg-gray-50"
                    style={{ borderColor: "#003049", color: "#003049" }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#003049" }}>
                    Save Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stock Availability Modal */}
        {showStockModal && (
          <div id="stock" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setShowStockModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-6" style={{ color: "#003049" }}>
                Current Stock Availability
              </h3>
              <div className="overflow-x-auto">
                {data.stock.length === 0 ? (
                  <p className="text-gray-500">No stock recorded yet.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "#003049" }}>
                        <th className="px-6 py-3 text-left text-white font-semibold">Material</th>
                        <th className="px-6 py-3 text-left text-white font-semibold">Category</th>
                        <th className="px-6 py-3 text-left text-white font-semibold">Available Quantity</th>
                        <th className="px-6 py-3 text-left text-white font-semibold">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.stock.map((item) => (
                        <tr key={item._id} className="border-b border-gray-200">
                          <td className="px-6 py-4 text-gray-700 font-medium">{item.name}</td>
                          <td className="px-6 py-4 text-gray-600">{item.category}</td>
                          <td className="px-6 py-4 text-gray-700 text-lg">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{new Date(item.updatedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <button
                onClick={() => setShowStockModal(false)}
                className="mt-6 w-full px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#003049" }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Create Dispatch Modal */}
        {showDispatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowDispatchModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-6" style={{ color: "#003049" }}>
                Create Dispatch Order
              </h3>
              <form onSubmit={handleDispatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                    Selected Request
                  </label>
                  <select disabled value={dispatchForm.requestId} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100">
                    {data.requests.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.requester?.name} - {r.region}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                    Destination Region
                  </label>
                  <input type="text" value={dispatchForm.destinationRegion} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.vehicleNo}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": "#003049" }}
                    placeholder="e.g. MH-12-AB-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.driverName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": "#003049" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>
                    Driver Phone
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.driverPhone}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ "--tw-ring-color": "#003049" }}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(false)}
                    className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-all hover:bg-gray-50"
                    style={{ borderColor: "#003049", color: "#003049" }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#003049" }}>
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
