import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";

export default function WarehouseDashboard() {
  const { data, fetchDashboardData, user, token } = useAuth(); // User needed for welcome message if any

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  
  // Forms State
  const [receiptForm, setReceiptForm] = useState({
    name: "",
    category: "Food",
    unit: "units",
    warehouse: "",
    quantity: "",
    source: "",
    remarks: "",
  });
  const [dispatchForm, setDispatchForm] = useState({
    requestId: "",
    warehouse: "",
    vehicleNo: "",
    driverName: "",
    driverPhone: "",
    destinationRegion: "",
    items: [],
    itemSelection: {},
    assignedTo: "", // New field
  });

  const [fieldWorkers, setFieldWorkers] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [message, setMessage] = useState({ text: "", type: "" });

  // Initial Data Load
  useEffect(() => {
    if (token) {
        fetchDashboardData();
    }
  }, [token]); // fetch when token is ready
  
  // Fetch Fieldworkers
  useEffect(() => {
    const fetchFW = async () => {
        try { 
            const res = await api.get('/users/role/fieldworker'); 
            setFieldWorkers(res.data); 
        } catch(e) {
            console.error("Failed to fetch fieldworkers", e);
        }
    };
    if (token) fetchFW();
  }, [token]);

  // Warehouse Context
  const assignedWarehouses = data.warehouses || [];
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  useEffect(() => {
     if (assignedWarehouses.length > 0 && !selectedWarehouseId) {
         setSelectedWarehouseId(assignedWarehouses[0]._id);
     }
  }, [assignedWarehouses]);

  // Filter Data by Warehouse
  const workspaceStock = data.stock.filter(item => !selectedWarehouseId || item.warehouse === selectedWarehouseId);
  // Requests are global effectively, but we could filter if they were region-mapped. Keeping them global for now.
  const workspaceDispatches = data.dispatches.filter(d => 
      !selectedWarehouseId || 
      (d.warehouse && (d.warehouse._id === selectedWarehouseId || d.warehouse === selectedWarehouseId))
  );

  // Filter Stock Logic (Category + Warehouse)
  const filteredStock = categoryFilter === "All" 
    ? workspaceStock 
    : workspaceStock.filter(item => item.category === categoryFilter);

  const totalStockAmount = filteredStock.reduce((sum, item) => sum + (item.currentStock || 0), 0);

  // Handlers
  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/materials/receipt", receiptForm);
      setMessage({ text: "Material receipt added successfully", type: "success" });
      setShowReceiptModal(false);
      fetchDashboardData(); // Refresh data
      setReceiptForm({ name: "", category: "Food", unit: "units", warehouse: "", quantity: "", source: "", remarks: "" });
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
        assignedTo: dispatchForm.assignedTo || undefined, // Send if selected
      };

      await api.post("/dispatch", payload);
      setMessage({ text: "Dispatch created successfully", type: "success" });
      setShowDispatchModal(false);
      fetchDashboardData();
      setDispatchForm({
        requestId: "",
        warehouse: "",
        vehicleNo: "",
        driverName: "",
        driverPhone: "",
        destinationRegion: "",
        items: [],
        itemSelection: {},
        assignedTo: "",
      });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to create dispatch", type: "error" });
    }
  };

  // Filter approved requests for Dispatch creation
  const approvedRequests = data.requests.filter((r) => r.status === "approved");

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <h1 className="text-4xl font-bold mb-2 text-[#003049] dark:text-white">
            Warehouse Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Manage incoming materials and outgoing dispatches</p>
        </div>
        
        {/* Warehouse Selector */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 min-w-[250px]">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Current Warehouse</label>
            {assignedWarehouses.length === 0 ? (
                <div className="text-red-500 text-sm font-semibold">No Assigned Warehouses</div>
            ) : (
                <select 
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-700 border-none rounded-lg font-bold text-[#003049] dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                    {assignedWarehouses.map(w => (
                        <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                </select>
            )}
        </div>
      </div>

       {/* Messages */}
       {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
              {message.text}
              <button onClick={() => setMessage({ text: "", type: "" })} className="float-right font-bold">
                &times;
              </button>
            </div>
      )}

          {/* Action Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Log Material Receipt Card */}
            <div id="log-receipt" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#003049] dark:text-blue-400">
                    Details of Material Receipt
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">Record incoming materials (receipt + stock update)</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#003049] dark:bg-blue-600">
                  <span className="text-white text-2xl">📦</span>
                </div>
              </div>
              <button
                onClick={() => {
                    setReceiptForm(prev => ({ ...prev, warehouse: selectedWarehouseId }));
                    setShowReceiptModal(true);
                }}
                disabled={!selectedWarehouseId}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg bg-[#003049] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log Receipt & Update Stock
              </button>
            </div>

            {/* View Stock Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-[#003049] dark:text-blue-400">
                    Stock Inventory
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">View current availability across categories</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#003049] dark:bg-blue-600">
                  <span className="text-white text-2xl">📊</span>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('stock').scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg bg-[#003049] dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                View Current Stock
              </button>
            </div>
          </div>

          {/* Logged Material Receipts */}
          {/* Warehouse Filtered Receipts */}
           <div
            id="receipt-list"
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:col-span-2 mb-8"
            style={{
              maxHeight: "320px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 className="text-2xl font-bold mb-4 text-[#003049] dark:text-blue-400">
              Logged Material Receipts
            </h2>

            {data.receipts && data.receipts.filter(r => !selectedWarehouseId || r.warehouse === selectedWarehouseId).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No receipts logged yet for this warehouse.</p>
            ) : (
              <div
                className="space-y-4 overflow-y-auto pr-2"
                style={{ maxHeight: "220px" }}
              >
                {data.receipts.filter(r => !selectedWarehouseId || r.warehouse === selectedWarehouseId).map((r, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-center bg-gray-50 dark:bg-slate-700/50">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{r.materialName || r.material || "Material"}</p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">Quantity: {r.quantity || 0}</p>

                      <p className="text-xs text-gray-400 dark:text-gray-500">Source: {r.source || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Section */}
          <div id="stock" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 text-[#003049] dark:text-blue-400">
              Current Stock Availability
            </h2>
            
            {/* Category Filter */}
            <div className="mb-4 flex items-center gap-4">
                <label className="text-gray-700 dark:text-gray-300 font-semibold">Filter by Category:</label>
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                    <option value="All">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Water">Water</option>
                    <option value="Medical">Medical</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Clothing">Clothing</option>
                </select>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              {filteredStock.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No stock found for this category in selected warehouse.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#003049] dark:bg-slate-900">
                      <th className="px-6 py-3 text-left text-white font-semibold">Material</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Category</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Available Quantity</th>
                      <th className="px-6 py-3 text-left text-white font-semibold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((item) => (
                      <tr key={item._id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.category}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-lg">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-500 text-sm">{new Date(item.updatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Amount Row */}
                  <tfoot>
                    <tr className="bg-gray-100 dark:bg-slate-700 font-bold border-t-2 border-gray-300 dark:border-slate-500">
                      <td className="px-6 py-4 text-gray-800 dark:text-white" colSpan="2">Total Amount ({categoryFilter === "All" ? "All" : categoryFilter})</td>
                      <td className="px-6 py-4 text-[#003049] dark:text-blue-400 text-xl">{totalStockAmount}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>

      {/* Pending Requests Section */}
      <div id="pending-requests" className="mb-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-[#003049] dark:text-blue-400 mb-4">Pending Material Requests</h2>
        {data.requests.filter(r => r.status === 'pending').length === 0 ? (
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center">
               <p className="text-gray-500 dark:text-gray-400">No pending requests.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.requests.filter(r => r.status === 'pending').map(req => (
                  <div key={req._id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border-l-4 border-yellow-400 dark:border-yellow-500">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#003049] dark:bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {req.requester?.name?.substring(0, 2).toUpperCase() || "NG"}
                              </div>
                              <div>
                                  <h3 className="font-bold text-[#003049] dark:text-blue-400">{req.requester?.name || "Unknown NGO"}</h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{req.region}</p>
                              </div>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-bold px-3 py-1 rounded-full uppercase">
                              Pending
                          </span>
                      </div>
                      
                      <div className="mb-6">
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Requested Items (Waiting Admin Approval):</p>
                          <div className="flex flex-wrap gap-2">
                              {req.items.map((i, idx) => (
                                  <span key={idx} className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg text-sm font-medium">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[#003049] dark:text-blue-400">
              Approved NGO Requests (Ready for Dispatch)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create dispatch orders for approved requests</p>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              {approvedRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No approved requests pending dispatch.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#003049] dark:bg-slate-900 sticky top-0 z-10">
                      <th className="px-6 py-4 text-left text-white font-semibold">NGO / Region</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Items Requested</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedRequests.map((req) => (
                      <tr key={req._id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          <div className="font-semibold">{req.requester?.name || "Unknown NGO"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{req.region}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {req.items.map((i, idx) => (
                            <span key={idx} className="inline-block bg-gray-100 dark:bg-slate-700 rounded px-2 py-1 text-xs mr-1 mb-1">
                              {i.materialName}: {i.quantity}
                            </span>
                          ))}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setDispatchForm((prev) => ({ 
                                  ...prev, 
                                  requestId: req._id, 
                                  destinationRegion: req.region,
                                  warehouse: selectedWarehouseId // Auto-set warehouse
                              }));
                              setShowDispatchModal(true);
                            }}
                            disabled={!selectedWarehouseId}
                            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity bg-[#003049] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div id="dispatch" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 scroll-mt-8">
            <h2 className="text-2xl font-bold mb-4 text-[#003049] dark:text-blue-400">
              Dispatch Tracking
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Monitor status of outgoing dispatches</p>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              {workspaceDispatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No dispatches found for selected warehouse.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#003049] dark:bg-slate-900 sticky top-0 z-10">
                      <th className="px-6 py-4 text-left text-white font-semibold">Dispatch ID</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Destination</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                      <th className="px-6 py-4 text-left text-white font-semibold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaceDispatches.map((disp) => (
                      <tr key={disp._id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">#{disp._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{disp.destinationRegion}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold
                            ${disp.status === "completed" || disp.status === "Delivered" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : disp.status === "in_transit" || disp.status === "In Transit" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"}`}
                          >
                            {disp.status === 'completed' ? 'DELIVERED' : disp.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                             {/* Only show 'Mark In Transit' if status is pending or packed */}
                             {(disp.status === 'pending' || disp.status === 'packed') && (
                                 <button
                                    onClick={async () => {
                                        try {
                                            await api.patch(`/dispatch/${disp._id}/status`, { status: 'in_transit' });
                                            fetchDashboardData();
                                            setMessage({ text: "Dispatch marked as In Transit", type: "success" });
                                        } catch(e) {
                                            setMessage({ text: "Error updating status", type: "error" });
                                        }
                                    }}
                                    className="px-3 py-1 rounded text-white text-xs hover:bg-blue-700 bg-blue-600"
                                 >
                                    Mark In Transit
                                 </button>
                             )}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-400">
                          {new Date(disp.updatedAt).toLocaleDateString()} {new Date(disp.updatedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        {/* Material Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-8 relative">
              <button onClick={() => setShowReceiptModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-xl font-bold">
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-6 text-[#003049] dark:text-white">
                Log Material Receipt
              </h3>
              <form onSubmit={handleReceiptSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Material Name
                  </label>
                  <input
                    type="text"
                    required
                    value={receiptForm.name}
                    onChange={(e) => setReceiptForm({ ...receiptForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="e.g. Water Bottles"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                      Category
                    </label>
                    <select
                      value={receiptForm.category}
                      onChange={(e) => setReceiptForm({ ...receiptForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 dark:text-white"
                    >
                      <option value="Food">Food</option>
                      <option value="Water">Water</option>
                      <option value="Medical">Medical</option>
                      <option value="Shelter">Shelter</option>
                      <option value="Clothing">Clothing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={receiptForm.quantity}
                      onChange={(e) => setReceiptForm({ ...receiptForm, quantity: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                      Warehouse
                   </label>
                   <select
                      value={receiptForm.warehouse}
                      onChange={(e) => setReceiptForm({ ...receiptForm, warehouse: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 dark:text-white"
                   >
                      <option value="">Select Warehouse</option>
                      {data.warehouses?.map(w => (
                          <option key={w._id} value={w._id}>{w.name}</option>
                      ))}
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Source / Supplier
                  </label>
                  <input
                    type="text"
                    value={receiptForm.source}
                    onChange={(e) => setReceiptForm({ ...receiptForm, source: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="e.g. ABC Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Remarks
                  </label>
                  <textarea
                    value={receiptForm.remarks}
                    onChange={(e) => setReceiptForm({ ...receiptForm, remarks: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                    rows="2"
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-all hover:bg-gray-50 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-gray-300"
                    style={{ borderColor: "#003049", color: "#003049" }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 bg-[#003049] dark:bg-blue-600 dark:hover:bg-blue-500">
                    Save Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Dispatch Modal */}
        {showDispatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowDispatchModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-xl font-bold">
                &times;
              </button>
              <h3 className="text-2xl font-bold mb-6 text-[#003049] dark:text-white">
                Create Dispatch Order
              </h3>
              <form onSubmit={handleDispatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Selected Request
                  </label>
                  <select disabled value={dispatchForm.requestId} className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 dark:text-white">
                    {data.requests.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.requester?.name} - {r.region}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                      From Warehouse
                    </label>
                    <select
                        value={dispatchForm.warehouse}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, warehouse: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 dark:text-white"
                    >
                        <option value="">Select Warehouse</option>
                        {data.warehouses?.map(w => (
                            <option key={w._id} value={w._id}>{w.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Destination Region
                  </label>
                  <input type="text" value={dispatchForm.destinationRegion} readOnly className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.vehicleNo}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="e.g. MH-12-AB-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.driverName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Driver Phone
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.driverPhone}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>

                {/* Assign Fieldworker Dropdown */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                    Assign Fieldworker (Optional)
                  </label>
                  <select
                    value={dispatchForm.assignedTo}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">-- Unassigned (Pool) --</option>
                    {fieldWorkers.map(fw => (
                        <option key={fw._id} value={fw._id}>{fw.name} ({fw.email})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(false)}
                    className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-all hover:bg-gray-50 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-gray-300"
                    style={{ borderColor: "#003049", color: "#003049" }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 bg-[#003049] dark:bg-blue-600 dark:hover:bg-blue-500">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
