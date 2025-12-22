import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import DashboardLayout from "../layouts/DashboardLayout";
import GlassCard from "../components/ui/GlassCard";

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
        <GlassCard className="p-4 min-w-[250px] flex flex-col justify-center" delay={0}>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Current Warehouse</label>
            {assignedWarehouses.length === 0 ? (
                <div className="text-red-400 text-sm font-semibold">No Assigned Warehouses</div>
            ) : (
                <select 
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full bg-black/20 border-none rounded-lg font-bold text-white focus:ring-2 focus:ring-blue-500/50 p-2 cursor-pointer hover:bg-black/30 transition-colors"
                >
                    {assignedWarehouses.map(w => (
                        <option key={w._id} value={w._id} className="bg-slate-800 text-white">{w.name}</option>
                    ))}
                </select>
            )}
        </GlassCard>
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
            <GlassCard id="log-receipt" className="p-6 relative overflow-hidden group border-blue-500/30" delay={0.1}>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-9xl">📦</span>
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors">
                    Details of Material Receipt
                  </h2>
                  <p className="text-slate-400">Record incoming materials (receipt + stock update)</p>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
              <button
                onClick={() => {
                    setReceiptForm(prev => ({ ...prev, warehouse: selectedWarehouseId }));
                    setShowReceiptModal(true);
                }}
                disabled={!selectedWarehouseId}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed group-hover:translate-y-[-2px]"
              >
                Log Receipt & Update Stock
              </button>
            </GlassCard>

            {/* View Stock Card */}
            <GlassCard className="p-6 relative overflow-hidden group border-emerald-500/30" delay={0.2}>
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-9xl">📊</span>
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white group-hover:text-emerald-300 transition-colors">
                    Stock Inventory
                  </h2>
                  <p className="text-slate-400">View current availability across categories</p>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <button
                onClick={() => document.getElementById('stock').scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-emerald-600 hover:bg-emerald-500 group-hover:translate-y-[-2px]"
              >
                View Current Stock
              </button>
            </GlassCard>
          </div>

          {/* Logged Material Receipts */}
          {/* Warehouse Filtered Receipts */}
          <GlassCard id="receipt-list" className="p-6 md:col-span-2 mb-8 flex flex-col h-[320px]" delay={0.3}>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Logged Material Receipts
            </h2>

            {data.receipts && data.receipts.filter(r => !selectedWarehouseId || r.warehouse === selectedWarehouseId).length === 0 ? (
              <p className="text-slate-400">No receipts logged yet for this warehouse.</p>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {data.receipts.filter(r => !selectedWarehouseId || r.warehouse === selectedWarehouseId).map((r, idx) => (
                  <div key={idx} className="border border-white/10 rounded-lg p-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-semibold text-white">{r.materialName || r.material || "Material"}</p>

                      <p className="text-sm text-slate-400">Quantity: {r.quantity || 0}</p>

                      <p className="text-xs text-slate-500">Source: {r.source || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Stock Section */}
          <GlassCard id="stock" className="p-6 mb-8 scroll-mt-8" delay={0.4}>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Current Stock Availability
            </h2>
            
            {/* Category Filter */}
            <div className="mb-4 flex items-center gap-4">
                <label className="text-slate-300 font-semibold">Filter by Category:</label>
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                    <option value="All" className="bg-slate-800">All Categories</option>
                    <option value="Food" className="bg-slate-800">Food</option>
                    <option value="Water" className="bg-slate-800">Water</option>
                    <option value="Medical" className="bg-slate-800">Medical</option>
                    <option value="Shelter" className="bg-slate-800">Shelter</option>
                    <option value="Clothing" className="bg-slate-800">Clothing</option>
                </select>
            </div>

            <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
              {filteredStock.length === 0 ? (
                <p className="text-slate-400">No stock found for this category in selected warehouse.</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Material</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Category</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Available Quantity</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStock.map((item) => (
                      <tr key={item._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-slate-400">{item.category}</td>
                        <td className="px-6 py-4 text-blue-400 text-lg font-bold">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{new Date(item.updatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total Amount Row */}
                  <tfoot>
                    <tr className="bg-white/5 font-bold border-t border-white/10">
                      <td className="px-6 py-4 text-white" colSpan="2">Total Amount ({categoryFilter === "All" ? "All" : categoryFilter})</td>
                      <td className="px-6 py-4 text-blue-400 text-xl">{totalStockAmount}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </GlassCard>

      {/* Pending Requests Section */}
      <div id="pending-requests" className="mb-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Pending Material Requests</h2>
        {data.requests.filter(r => r.status === 'pending').length === 0 ? (
           <GlassCard className="p-6 text-center" delay={0.4}>
               <p className="text-slate-400">No pending requests.</p>
           </GlassCard>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.requests.filter(r => r.status === 'pending').map(req => (
                  <GlassCard key={req._id} className="p-6 border-l-4 border-yellow-500" delay={0.4}>
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {req.requester?.name?.substring(0, 2).toUpperCase() || "NG"}
                              </div>
                              <div>
                                  <h3 className="font-bold text-white">{req.requester?.name || "Unknown NGO"}</h3>
                                  <p className="text-xs text-slate-400">{req.region}</p>
                              </div>
                          </div>
                          <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full uppercase border border-yellow-500/30">
                              Pending
                          </span>
                      </div>
                      
                      <div className="mb-6">
                          <p className="text-sm font-semibold text-slate-400 mb-2">Requested Items (Waiting Admin Approval):</p>
                          <div className="flex flex-wrap gap-2">
                              {req.items.map((i, idx) => (
                                  <span key={idx} className="bg-white/10 text-slate-300 px-3 py-1 rounded-lg text-sm font-medium border border-white/5">
                                      {i.materialName}: {i.quantity}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </GlassCard>
              ))}
           </div>
        )}
      </div>

          {/* Approved NGO Requests Section */}
          <GlassCard className="p-6 mb-8" delay={0.5}>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Approved NGO Requests (Ready for Dispatch)
            </h2>
            <p className="text-slate-400 mb-6">Create dispatch orders for approved requests</p>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              {approvedRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No approved requests pending dispatch.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 sticky top-0 z-10 bg-obisidian-foreground/50 backdrop-blur-md">
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">NGO / Region</th>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Items Requested</th>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {approvedRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white">
                          <div className="font-semibold">{req.requester?.name || "Unknown NGO"}</div>
                          <div className="text-xs text-slate-400">{req.region}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {req.items.map((i, idx) => (
                            <span key={idx} className="inline-block bg-white/10 rounded px-2 py-1 text-xs mr-1 mb-1 border border-white/5">
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
                            className="px-4 py-2 rounded-lg text-white font-medium hover:shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </GlassCard>

          {/* Dispatch Tracking Section */}
          <GlassCard id="dispatch" className="p-6 scroll-mt-8" delay={0.6}>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Dispatch Tracking
            </h2>
            <p className="text-slate-400 mb-6">Monitor status of outgoing dispatches</p>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              {workspaceDispatches.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No dispatches found for selected warehouse.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 sticky top-0 z-10 bg-obsidian-foreground/50 backdrop-blur-md">
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Dispatch ID</th>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Destination</th>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Actions</th>
                      <th className="px-6 py-4 text-left text-slate-300 font-semibold">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {workspaceDispatches.map((disp) => (
                      <tr key={disp._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-slate-300 font-mono text-xs">#{disp._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-slate-300">{disp.destinationRegion}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold border 
                            ${disp.status === "completed" || disp.status === "Delivered" ? "bg-green-500/20 text-green-300 border-green-500/30" : disp.status === "in_transit" || disp.status === "In Transit" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}`}
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
                                    className="px-3 py-1 rounded text-white text-xs hover:bg-blue-500 bg-blue-600 shadow-md transition-all"
                                 >
                                    Mark In Transit
                                 </button>
                             )}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(disp.updatedAt).toLocaleDateString()} {new Date(disp.updatedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </GlassCard>

        {/* Material Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-md w-full p-8 relative" delay={0}>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-2xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Log Material Receipt
              </h3>
              <form onSubmit={handleReceiptSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Material Name
                  </label>
                  <input
                    type="text"
                    required
                    value={receiptForm.name}
                    onChange={(e) => setReceiptForm({ ...receiptForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                    placeholder="e.g. Water Bottles"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                      Category
                    </label>
                    <select
                      value={receiptForm.category}
                      onChange={(e) => setReceiptForm({ ...receiptForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="Food" className="bg-slate-800">Food</option>
                      <option value="Water" className="bg-slate-800">Water</option>
                      <option value="Medical" className="bg-slate-800">Medical</option>
                      <option value="Shelter" className="bg-slate-800">Shelter</option>
                      <option value="Clothing" className="bg-slate-800">Clothing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                      Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={receiptForm.quantity}
                      onChange={(e) => setReceiptForm({ ...receiptForm, quantity: e.target.value })}
                      className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-2 text-slate-300">
                      Warehouse
                   </label>
                   <select
                      value={receiptForm.warehouse}
                      onChange={(e) => setReceiptForm({ ...receiptForm, warehouse: e.target.value })}
                      className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                   >
                      <option value="" className="bg-slate-800">Select Warehouse</option>
                      {data.warehouses?.map(w => (
                          <option key={w._id} value={w._id} className="bg-slate-800">{w.name}</option>
                      ))}
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Source / Supplier
                  </label>
                  <input
                    type="text"
                    value={receiptForm.source}
                    onChange={(e) => setReceiptForm({ ...receiptForm, source: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                    placeholder="e.g. ABC Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Remarks
                  </label>
                  <textarea
                    value={receiptForm.remarks}
                    onChange={(e) => setReceiptForm({ ...receiptForm, remarks: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                    rows="2"
                  ></textarea>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(false)}
                    className="flex-1 px-6 py-3 border border-white/10 rounded-lg font-semibold text-slate-300 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all transform active:scale-95">
                    Save Receipt
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

        {/* Create Dispatch Modal */}
        {showDispatchModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto" delay={0}>
              <button 
                onClick={() => setShowDispatchModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-2xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                Create Dispatch Order
              </h3>
              <form onSubmit={handleDispatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Selected Request
                  </label>
                  <select disabled value={dispatchForm.requestId} className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-slate-400 cursor-not-allowed">
                    {data.requests.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.requester?.name} - {r.region}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Destination Region
                  </label>
                  <input type="text" value={dispatchForm.destinationRegion} readOnly className="w-full px-4 py-3 border border-white/10 rounded-lg bg-white/5 text-slate-400 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-300">
                      From Warehouse
                    </label>
                    <select
                        value={dispatchForm.warehouse}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, warehouse: e.target.value })}
                        className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                    >
                        <option value="" className="bg-slate-800">Select Warehouse</option>
                        {data.warehouses?.map(w => (
                            <option key={w._id} value={w._id} className="bg-slate-800">{w.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.vehicleNo}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNo: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                    placeholder="e.g. MH-12-AB-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.driverName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Driver Phone
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.driverPhone}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                  />
                </div>
                
                {/* Assign Fieldworker Dropdown */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-300">
                    Assign Fieldworker (Optional)
                  </label>
                  <select
                    value={dispatchForm.assignedTo}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                  >
                    <option value="" className="bg-slate-800">-- Unassigned (Pool) --</option>
                    {fieldWorkers.map(fw => (
                        <option key={fw._id} value={fw._id} className="bg-slate-800">{fw.name} ({fw.email})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(false)}
                    className="flex-1 px-6 py-3 border border-white/10 rounded-lg font-semibold text-slate-300 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all transform active:scale-95">
                    Create
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
    </DashboardLayout>
  );
}
