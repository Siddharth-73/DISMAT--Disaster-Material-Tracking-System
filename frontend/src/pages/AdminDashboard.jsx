import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import DashboardLayout from "../layouts/DashboardLayout";
import AnalyticsDashboard from "./superadmin/AnalyticsDashboard";

export default function AdminDashboard() {
  const { data, fetchDashboardData, user } = useAuth()
  const [message, setMessage] = useState({ text: "", type: "" })

  // Dispatch State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
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

  const [fieldWorkers, setFieldWorkers] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Auto-select first warehouse
  useEffect(() => {
    if (data.warehouses && data.warehouses.length > 0 && !dispatchForm.warehouse) {
        setDispatchForm(prev => ({ ...prev, warehouse: data.warehouses[0]._id }));
    }
  }, [data.warehouses]);

  // Fetch Fieldworkers
  useEffect(() => {
    const fetchFW = async () => {
        try { 
            const res = await api.get('/users/role/fieldworker'); 
            setFieldWorkers(res.data); 
        } catch(e) { /* ignore */ }
    };
    fetchFW();
  }, []);

  // Filter Stock Logic
  const filteredStock = categoryFilter === "All" 
    ? data.stock 
    : data.stock.filter(item => item.category === categoryFilter);

  const totalStockAmount = filteredStock.reduce((sum, item) => sum + (item.currentStock || 0), 0);

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
        assignedTo: dispatchForm.assignedTo || undefined,
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Derived Stats
  const totalMaterials = data.stock.reduce((sum, item) => sum + (item.totalReceived || 0), 0)
  const totalDispatched = data.dispatches.length 
  const activeRequests = data.requests.filter(r => r.status?.toLowerCase() === "pending").length

  // Activity Feed
  const activities = [
    ...data.requests.map(r => ({
      type: "request",
      title: r.status?.toLowerCase() === 'pending' ? "New NGO Request" : `Request ${r.status}`,
      desc: `${r.requester?.name || "NGO"} requested materials for ${r.region}`,
      time: r.updatedAt || r.createdAt,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
      iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    })),
    ...data.dispatches.map(d => ({
      type: "dispatch",
      title: "Dispatch Update",
      desc: `Dispatch to ${d.destinationRegion} is ${d.status === 'completed' ? 'Delivered' : d.status}`,
      time: d.updatedAt || d.createdAt,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
      iconPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    })),
    ...data.receipts.map(r => ({
      type: "receipt",
      title: "Material Received",
      desc: `Received ${r.quantity} ${r.materialName} from ${r.source || "Unknown"}`,
      time: r.receivedAt,
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10) // Show last 10

  const handleRequestAction = async (id, action) => {
    try {
      await api.patch(`/requests/${id}/${action}`)
      setMessage({ text: `Request ${action}ed successfully`, type: "success" })
      fetchDashboardData()
    } catch (err) {
      setMessage({ text: err.response?.data?.message || `Failed to ${action} request`, type: "error" })
    }
  }

  return (
    <DashboardLayout>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#003049] dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor and manage disaster relief operations in real-time</p>
      </div>

        {message.text && (
           <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
             {message.text}
             <button onClick={() => setMessage({ text: "", type: "" })} className="float-right font-bold">&times;</button>
           </div>
         )}
        
        {/* Analytics Section */}
        <div className="mb-8">
          <AnalyticsDashboard />
        </div>

      {/* System Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Materials Received */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#003049] dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#003049] dark:text-white mb-1">{totalMaterials}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Units Received</p>
        </div>

        {/* Total Stock Types */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#003049] dark:text-white mb-1">{data.stock.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Unique Material Types</p>
        </div>

        {/* Total Dispatches */}
         <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-emerald-700 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#003049] dark:text-white mb-1">{totalDispatched}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Dispatches</p>
        </div>

        {/* Active Requests */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-orange-700 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#003049] dark:text-white mb-1">{activeRequests}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
        </div>
      </div>

      {/* NGO Requests Management Section (Replaced Pending/Approved separate lists with one unified table for Admin) */}
      <div id="ngo-requests" className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-[#003049] dark:text-white mb-6">NGO Requests Management</h2>
        
        {/* PENDING REQUESTS */}
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-slate-700 pb-2">Pending Actions</h3>
        <div className="overflow-x-auto mb-8">
          {data.requests.filter(r => r.status === 'pending').length === 0 ? (
               <p className="text-gray-500 dark:text-gray-400 text-sm py-2">No pending requests.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {data.requests.filter(r => r.status === 'pending').map(req => (
                  <div key={req._id} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                      <div className="flex justify-between">
                         <h4 className="font-bold text-[#003049] dark:text-blue-300">{req.requester?.name || "NGO"}</h4>
                         <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full uppercase font-bold">Pending</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{req.region}</p>
                      <div className="mb-3 text-sm">
                          {req.items.map((i, idx) => (
                             <span key={idx} className="mr-2 bg-white dark:bg-slate-600 px-2 py-1 border dark:border-slate-500 rounded text-xs dark:text-gray-200">{i.materialName}: {i.quantity}</span>
                          ))}
                      </div>
                      <div className="flex gap-2">
                           <button onClick={() => handleRequestAction(req._id, "approve")} className="flex-1 bg-green-500 text-white py-1 rounded text-sm hover:bg-green-600">Approve</button>
                           <button onClick={() => handleRequestAction(req._id, "reject")} className="flex-1 bg-red-500 text-white py-1 rounded text-sm hover:bg-red-600">Deny</button>
                      </div>
                  </div>
               ))}
            </div>
          )}
        </div>

        {/* APPROVED REQUESTS (Ready for Dispatch) */}
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-slate-700 pb-2">Ready for Dispatch</h3>
        <div className="overflow-x-auto mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {data.requests.filter(r => r.status === 'approved').length === 0 ? (
               <p className="text-gray-500 dark:text-gray-400 text-sm py-2">No approved requests waiting for dispatch.</p>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {data.requests.filter(r => r.status === 'approved').map(req => (
                  <div key={req._id} className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex justify-between">
                         <h4 className="font-bold text-[#003049] dark:text-white">{req.requester?.name || "NGO"}</h4>
                         <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full uppercase font-bold">Approved</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{req.region}</p>
                      <div className="mb-3 text-sm">
                          {req.items.map((i, idx) => (
                             <span key={idx} className="mr-2 bg-white dark:bg-slate-600 px-2 py-1 border dark:border-slate-500 rounded text-xs dark:text-gray-200">{i.materialName}: {i.quantity}</span>
                          ))}
                      </div>
                      <button 
                          onClick={() => {
                              setDispatchForm(prev => ({ ...prev, requestId: req._id, destinationRegion: req.region }));
                              setShowDispatchModal(true);
                          }} 
                          className="w-full bg-[#003049] dark:bg-blue-600 text-white py-2 rounded text-sm hover:opacity-90 mt-1 shadow-sm"
                      >
                          Create Dispatch
                      </button>
                  </div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Public Emergency Reports Section */}
      <div id="public-reports" className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8 scroll-mt-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Public Emergency Reports
            </h2>
            <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                {data.emergencyReports?.length || 0} Reports
            </span>
        </div>
        
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
           {(!data.emergencyReports || data.emergencyReports.length === 0) ? (
               <p className="text-gray-500 dark:text-gray-400 text-center py-4">No emergency reports received.</p>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.emergencyReports.map(rep => (
                    <div key={rep._id} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{rep.location}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(rep.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">{rep.description}</p>
                        <div className="border-t border-red-100 dark:border-red-800/30 pt-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span className="font-semibold">{rep.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span>{rep.contact}</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Stock Availability and Dispatch Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Availability */}
        <div id="stock" className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 scroll-mt-8">
          <h2 className="text-2xl font-bold text-[#003049] dark:text-white mb-6">Stock Availability</h2>
          
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

          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {filteredStock.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No stock available.</p> : (
            <div>

            {filteredStock.map(item => (
                <div key={item._id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-200">{item.name} <span className="text-xs text-gray-500 dark:text-gray-400">({item.category})</span></h3>
                    <span className="text-2xl font-bold text-[#003049] dark:text-blue-400">{item.currentStock}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">Last updated: {new Date(item.updatedAt).toLocaleString()}</p>
                </div>
            ))}
            <div className="border-t-2 border-gray-300 dark:border-slate-600 mt-4 pt-4 flex justify-between font-bold">
                 <span className="text-gray-800 dark:text-white">Total Amount ({categoryFilter})</span>
                 <span className="text-[#003049] dark:text-blue-400 text-xl">{totalStockAmount}</span>
            </div>
            </div>
            )}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#003049] dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
             {activities.length === 0 ? <p className="text-gray-500 dark:text-gray-400">No recent activity.</p> : activities.map((act, idx) => (
                <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${act.color}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={act.iconPath} />
                    </svg>
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-slate-700 mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{act.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{act.desc}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(act.time).toLocaleString()}</p>
                </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Dispatch Tracking */}
      <div id="dispatch" className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mt-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-[#003049] dark:text-white mb-6">Dispatch Tracking</h2>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
            {data.dispatches.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No dispatches found.</p>
            ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Dispatch ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Destination</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.dispatches.map(disp => (
                  <tr key={disp._id} className="border-b border-gray-100 dark:border-slate-700 hover:bg-[#fdf0d5]/30 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">#{disp._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{disp.destinationRegion}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full 
                        ${disp.status === 'completed' || disp.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                          disp.status === 'in_transit' || disp.status === 'In Transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                        {disp.status === 'completed' ? 'DELIVERED' : disp.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-400">{new Date(disp.updatedAt).toLocaleDateString()}</td>
                  </tr>
              ))}
            </tbody>
          </table>
            )}
        </div>
      </div>
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
                    Destination Region
                  </label>
                  <input type="text" value={dispatchForm.destinationRegion} readOnly className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">
                      From Warehouse
                    </label>
                    <select
                        value={dispatchForm.warehouse}
                        onChange={(e) => setDispatchForm({ ...dispatchForm, warehouse: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 dark:text-white"
                        style={{ "--tw-ring-color": "#003049" }}
                    >
                        <option value="">Select Warehouse</option>
                        {data.warehouses?.map(w => (
                            <option key={w._id} value={w._id}>{w.name}</option>
                        ))}
                    </select>
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
                    style={{ "--tw-ring-color": "#003049" }}
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
                    style={{ "--tw-ring-color": "#003049" }}
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
                    style={{ "--tw-ring-color": "#003049" }}
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
  )
}
