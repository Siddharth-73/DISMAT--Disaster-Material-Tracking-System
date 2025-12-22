import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import DashboardLayout from "../layouts/DashboardLayout";
import AnalyticsDashboard from "./superadmin/AnalyticsDashboard";
import GlassCard from "../components/ui/GlassCard";

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
        <GlassCard className="p-6 group relative overflow-hidden" delay={0.1}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg className="w-24 h-24 text-blue-500 transform rotate-12 translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalMaterials}</p>
            <p className="text-sm text-slate-400">Total Units Received</p>
          </div>
        </GlassCard>

        {/* Total Stock Types */}
        <GlassCard className="p-6 group relative overflow-hidden" delay={0.2}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg className="w-24 h-24 text-green-500 transform rotate-12 translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div className="relative z-10">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{data.stock.length}</p>
              <p className="text-sm text-slate-400">Unique Material Types</p>
          </div>
        </GlassCard>

        {/* Total Dispatches */}
         <GlassCard className="p-6 group relative overflow-hidden" delay={0.3}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg className="w-24 h-24 text-emerald-500 transform rotate-12 translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalDispatched}</p>
            <p className="text-sm text-slate-400">Total Dispatches</p>
          </div>
        </GlassCard>

        {/* Active Requests */}
        <GlassCard className="p-6 group relative overflow-hidden" delay={0.4}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <svg className="w-24 h-24 text-orange-500 transform rotate-12 translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
           <div className="relative z-10">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{activeRequests}</p>
            <p className="text-sm text-slate-400">Pending Requests</p>
           </div>
        </GlassCard>
      </div>

      {/* NGO Requests Management Section */}
      <GlassCard id="ngo-requests" className="p-6 mb-8 scroll-mt-8" delay={0.5}>
        <h2 className="text-2xl font-bold text-white mb-6">NGO Requests Management</h2>
        
        {/* PENDING REQUESTS */}
        <h3 className="text-lg font-semibold text-slate-300 mb-3 border-b border-white/10 pb-2">Pending Actions</h3>
        <div className="overflow-x-auto mb-8">
          {data.requests.filter(r => r.status === 'pending').length === 0 ? (
               <p className="text-slate-400 text-sm py-2">No pending requests.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {data.requests.filter(r => r.status === 'pending').map(req => (
                  <div key={req._id} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between">
                         <h4 className="font-bold text-blue-300">{req.requester?.name || "NGO"}</h4>
                         <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-1 rounded-full uppercase font-bold">Pending</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{req.region}</p>
                      <div className="mb-3 text-sm">
                          {req.items.map((i, idx) => (
                             <span key={idx} className="mr-2 bg-black/20 px-2 py-1 border border-white/5 rounded text-xs text-slate-300">{i.materialName}: {i.quantity}</span>
                          ))}
                      </div>
                      <div className="flex gap-2">
                           <button onClick={() => handleRequestAction(req._id, "approve")} className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 py-1 rounded-lg text-sm transition-all">Approve</button>
                           <button onClick={() => handleRequestAction(req._id, "reject")} className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 py-1 rounded-lg text-sm transition-all">Deny</button>
                      </div>
                  </div>
               ))}
            </div>
          )}
        </div>

        {/* APPROVED REQUESTS (Ready for Dispatch) */}
        <h3 className="text-lg font-semibold text-slate-300 mb-3 border-b border-white/10 pb-2">Ready for Dispatch</h3>
        <div className="overflow-x-auto mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {data.requests.filter(r => r.status === 'approved').length === 0 ? (
               <p className="text-slate-400 text-sm py-2">No approved requests waiting for dispatch.</p>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {data.requests.filter(r => r.status === 'approved').map(req => (
                  <div key={req._id} className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20 hover:bg-emerald-900/20 transition-colors">
                      <div className="flex justify-between">
                         <h4 className="font-bold text-white">{req.requester?.name || "NGO"}</h4>
                         <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-full uppercase font-bold">Approved</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{req.region}</p>
                      <div className="mb-3 text-sm">
                          {req.items.map((i, idx) => (
                             <span key={idx} className="mr-2 bg-black/20 px-2 py-1 border border-white/5 rounded text-xs text-slate-300">{i.materialName}: {i.quantity}</span>
                          ))}
                      </div>
                      <button 
                          onClick={() => {
                              setDispatchForm(prev => ({ ...prev, requestId: req._id, destinationRegion: req.region }));
                              setShowDispatchModal(true);
                          }} 
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm transition-all shadow-lg shadow-blue-600/20 mt-1"
                      >
                          Create Dispatch
                      </button>
                  </div>
               ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Public Emergency Reports Section */}
      <GlassCard id="public-reports" className="p-6 mb-8 scroll-mt-8" delay={0.6}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Public Emergency Reports
            </h2>
            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm font-bold">
                {data.emergencyReports?.length || 0} Reports
            </span>
        </div>
        
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
           {(!data.emergencyReports || data.emergencyReports.length === 0) ? (
               <p className="text-slate-400 text-center py-4">No emergency reports received.</p>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.emergencyReports.map(rep => (
                    <div key={rep._id} className="bg-red-900/10 border border-red-500/20 rounded-xl p-5 hover:bg-red-900/20 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-white text-lg">{rep.location}</h3>
                            <span className="text-xs text-slate-400">{new Date(rep.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300 mb-4 text-sm">{rep.description}</p>
                        <div className="border-t border-red-500/10 pt-3">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span className="font-semibold">{rep.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span>{rep.contact}</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
           )}
        </div>
      </GlassCard>

      {/* Stock Availability and Dispatch Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Availability */}
        {/* Stock Availability */}
        <GlassCard id="stock" className="p-6 scroll-mt-8" delay={0.7}>
          <h2 className="text-2xl font-bold text-white mb-6">Stock Availability</h2>
          
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

          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {filteredStock.length === 0 ? <p className="text-slate-400">No stock available.</p> : (
            <div>

            {filteredStock.map(item => (
                <div key={item._id} className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-white">{item.name} <span className="text-xs text-slate-400">({item.category})</span></h3>
                    <span className="text-2xl font-bold text-blue-400">{item.currentStock}</span>
                </div>
                <p className="text-xs text-slate-500">Last updated: {new Date(item.updatedAt).toLocaleString()}</p>
                </div>
            ))}
            <div className="border-t border-white/10 mt-4 pt-4 flex justify-between font-bold">
                 <span className="text-slate-300">Total Amount ({categoryFilter})</span>
                 <span className="text-blue-400 text-xl">{totalStockAmount}</span>
            </div>
            </div>
            )}
          </div>
        </GlassCard>

        {/* Activity Logs */}
        <GlassCard className="p-6" delay={0.8}>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
             {activities.length === 0 ? <p className="text-slate-400">No recent activity.</p> : activities.map((act, idx) => (
                <div key={idx} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${act.color} ring-2 ring-transparent group-hover:ring-white/20 transition-all`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={act.iconPath} />
                    </svg>
                    </div>
                    <div className="w-0.5 h-full bg-white/10 mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-slate-200">{act.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{act.desc}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(act.time).toLocaleString()}</p>
                </div>
                </div>
             ))}
          </div>
        </GlassCard>
      </div>

      {/* Dispatch Tracking */}
      <GlassCard id="dispatch" className="p-6 mt-8 scroll-mt-8" delay={0.9}>
        <h2 className="text-2xl font-bold text-white mb-6">Dispatch Tracking</h2>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
            {data.dispatches.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No dispatches found.</p>
            ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 sticky top-0 bg-obsidian-foreground/50 backdrop-blur-md z-10">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Dispatch ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Destination</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.dispatches.map(disp => (
                  <tr key={disp._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-slate-300 font-mono text-xs">#{disp._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 px-4 text-slate-300">{disp.destinationRegion}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border 
                        ${disp.status === 'completed' || disp.status === 'Delivered' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                          disp.status === 'in_transit' || disp.status === 'In Transit' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                        {disp.status === 'completed' ? 'DELIVERED' : disp.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{new Date(disp.updatedAt).toLocaleDateString()}</td>
                  </tr>
              ))}
            </tbody>
          </table>
            )}
        </div>
      </GlassCard>
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
                    Create Dispatch
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
      )}
    </DashboardLayout>
  )
}
