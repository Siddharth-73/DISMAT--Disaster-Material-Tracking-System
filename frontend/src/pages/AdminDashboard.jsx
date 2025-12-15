import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { data, fetchDashboardData, loadingData } = useAuth()
  const [message, setMessage] = useState({ text: "", type: "" })
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Derived Stats
  const totalMaterials = data.stock.reduce((sum, item) => sum + (item.totalReceived || 0), 0)
  const totalDispatched = data.data_stats?.totalDispatched || data.dispatches.length // Alternatively derived from dispatches
  // Stats derivation from stock/dispatches is limited by what info we have. 
  // We can count dispatches. 
  const activeRequests = data.requests.filter(r => r.status === "pending").length
  const totalPeopleHelped = 0 // Info not available in current API, keep 0 or remove? 
  // I'll keep it as a placeholder or remove it to be honest. "Remove fake stats" -> I'll remove it or set to "N/A"

  // Activity Feed
  // Combine Requests (created/approved/rejected), Dispatches (created/updated), Receipts (created)
  // We have:
  // - data.requests (createdAt, updatedAt, status)
  // - data.dispatches (createdAt, updatedAt, status)
  // - data.receipts (receivedAt, quantity, materialName)
  
  const activities = [
    ...data.requests.map(r => ({
      type: "request",
      title: r.status === 'pending' ? "New NGO Request" : `Request ${r.status}`,
      desc: `${r.requester?.name || "NGO"} requested materials for ${r.region}`,
      time: r.updatedAt || r.createdAt,
      color: "bg-orange-100 text-orange-600",
      iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    })),
    ...data.dispatches.map(d => ({
      type: "dispatch",
      title: "Dispatch Update",
      desc: `Dispatch to ${d.destinationRegion} is ${d.status}`,
      time: d.updatedAt || d.createdAt,
      color: "bg-blue-100 text-blue-600",
      iconPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    })),
    ...data.receipts.map(r => ({
      type: "receipt",
      title: "Material Received",
      desc: `Received ${r.quantity} ${r.materialName} from ${r.source || "Unknown"}`,
      time: r.receivedAt,
      color: "bg-green-100 text-green-600",
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
    <>{/* FIXED TOP BAR */}
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

    <div className="min-h-screen bg-[#fdf0d5] p-6 md:p-8 lg:ml-30">
      {/* Page Title */}
      <div className="mb-8 mt-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#003049] mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage disaster relief operations in real-time</p>
      </div>

       {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
            <button onClick={() => setMessage({ text: "", type: "" })} className="float-right font-bold">&times;</button>
          </div>
        )}

      {/* System Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Materials Received */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-[#003049]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#003049] mb-1">{totalMaterials}</p>
          <p className="text-sm text-gray-600">Total Units Received</p>
        </div>

        {/* Total Stock Types */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#003049] mb-1">{data.stock.length}</p>
          <p className="text-sm text-gray-600">Unique Material Types</p>
        </div>

        {/* Total Dispatches */}
         <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#003049] mb-1">{data.dispatches.length}</p>
          <p className="text-sm text-gray-600">Total Dispatches</p>
        </div>

        {/* Active Requests */}
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-[#003049] mb-1">{activeRequests}</p>
          <p className="text-sm text-gray-600">Pending Requests</p>
        </div>
      </div>

      {/* NGO Requests Section */}
      <div id="ngo-requests" className="bg-white rounded-xl shadow-md p-6 mb-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-[#003049] mb-6">NGO Requests Management</h2>
        <div className="overflow-x-auto">
            {data.requests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No requests found.</p>
            ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">NGO Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Region</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Requested Items</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.requests.map((req) => (
              <tr key={req._id} className="border-b border-gray-100 hover:bg-[#fdf0d5]/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#003049] rounded-full flex items-center justify-center text-white font-semibold">
                      {req.requester?.name?.substring(0, 2).toUpperCase() || "NG"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{req.requester?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{req.requester?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-700">{req.region}</td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {req.items.map((i, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {i.type}: {i.quantity}
                        </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full 
                    ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {req.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                        onClick={() => handleRequestAction(req._id, "approve")}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                        onClick={() => handleRequestAction(req._id, "reject")}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                  )}
                  {req.status !== 'pending' && <span className="text-gray-400 text-sm">Action taken</span>}
                </td>
              </tr>
              ))}
            </tbody>
          </table>
            )}
        </div>
      </div>

      {/* Stock Availability and Dispatch Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Availability */}
        <div id="stock" className="bg-white rounded-xl shadow-md p-6 scroll-mt-8">
          <h2 className="text-2xl font-bold text-[#003049] mb-6">Stock Availability</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {data.stock.length === 0 ? <p className="text-gray-500">No stock available.</p> : data.stock.map(item => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name} <span className="text-xs text-gray-500">({item.category})</span></h3>
                    <span className="text-2xl font-bold text-[#003049]">{item.currentStock}</span>
                </div>
                <p className="text-xs text-gray-500">Last updated: {new Date(item.updatedAt).toLocaleString()}</p>
                </div>
            ))}
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#003049] mb-6">Recent Activity</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
             {activities.length === 0 ? <p className="text-gray-500">No recent activity.</p> : activities.map((act, idx) => (
                <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${act.color}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={act.iconPath} />
                    </svg>
                    </div>
                    <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                </div>
                <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-gray-900">{act.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{act.desc}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(act.time).toLocaleString()}</p>
                </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Dispatch Tracking */}
      <div id="dispatch" className="bg-white rounded-xl shadow-md p-6 mt-8 scroll-mt-8">
        <h2 className="text-2xl font-bold text-[#003049] mb-6">Dispatch Tracking</h2>
        <div className="overflow-x-auto">
            {data.dispatches.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No dispatches found.</p>
            ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Dispatch ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Destination</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.dispatches.map(disp => (
                  <tr key={disp._id} className="border-b border-gray-100 hover:bg-[#fdf0d5]/30 transition-colors">
                    <td className="py-4 px-4 text-gray-700">#{disp._id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 px-4 text-gray-700">{disp.destinationRegion}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full 
                        ${disp.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                          disp.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 
                          'bg-yellow-100 text-yellow-700'}`}>
                        {disp.status || "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{new Date(disp.updatedAt).toLocaleDateString()}</td>
                  </tr>
              ))}
            </tbody>
          </table>
            )}
        </div>
      </div>
    </div></>
  )
}
