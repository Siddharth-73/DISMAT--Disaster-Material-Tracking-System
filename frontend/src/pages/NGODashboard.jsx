import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import { useNavigate } from "react-router-dom";

export default function NGODashboard() {
  const { data, fetchDashboardData, user } = useAuth()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestForm, setRequestForm] = useState({
    region: "",
    items: [{ type: "Food", quantity: "" }], // Start with one item
    remarks: ""
  })
  const [message, setMessage] = useState({ text: "", type: "" })
  const navigate = useNavigate();
  const { userr, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Handlers
  const handleAddItem = () => {
    setRequestForm({
        ...requestForm,
        items: [...requestForm.items, { type: "Food", quantity: "" }]
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = requestForm.items.filter((_, i) => i !== index)
    setRequestForm({ ...requestForm, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...requestForm.items]
    newItems[index][field] = value
    setRequestForm({ ...requestForm, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate
    if (!requestForm.region || requestForm.items.some(i => !i.quantity)) {
        setMessage({ text: "Please fill all required fields", type: "error" })
        return
    }

    try {
      await api.post("/requests", requestForm)
      setMessage({ text: "Request submitted successfully", type: "success" })
      setShowRequestModal(false)
      fetchDashboardData()
      setRequestForm({ region: "", items: [{ type: "Food", quantity: "" }], remarks: "" })
    } catch (err) {
       console.error(err)
       setMessage({ text: err.response?.data?.message || "Failed to submit request", type: "error" })
    }
  }

  // Filter data for this NGO (AuthContext fetches all, but backend for /requests filters by role if NGO. 
  // However, for Dispatches, the backend usually returns all or filtered. 
  // AuthContext 'data.requests' will contain only THIS user's requests if backend enforces it.
  // Let's assume AuthContext data is correct. Backend /requests for NGO returns own requests.
  
  // For Dispatches: Backend /dispatch returns all? Or implies filtering?
  // Let's filter client side to be safe: dispatches where request.requester._id === user._id
  // Actually, dispatch has 'request' populated.
  
  const myRequests = data.requests || []
  // Dispatch is linked to request. We want dispatches for MY requests.
  const myDispatches = data.dispatches.filter(d => 
      // Check if dispatch's request ID matches one of my request IDs (simple check)
      // OR deeply check dispatch.request.requester._id if populated
      // Backend populate: path: 'request', populate: { path: 'requester' } ??
      // Let's rely on finding standard match.
      myRequests.some(r => r._id === (d.request._id || d.request)) 
  )

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
    <div className=" bg-[#fdf0d5] border-b border-gray-200 mb-8 mt-10 min-h-screen">
       {/* Page Header */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2" style={{ color: "#003049" }}>
            NGO Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Request materials and track dispatches</p>
        </div>
      </div>

       <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
            <button onClick={() => setMessage({ text: "", type: "" })} className="float-right font-bold">&times;</button>
          </div>
        )}

        {/* Create Request CTA */}
        <div id="create-request" className="bg-white rounded-xl shadow-lg p-6 mb-8 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "#003049" }}>Need Supplies?</h2>
                <p className="text-gray-600">Submit a new request for relief materials.</p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 shadow-lg"
              style={{ backgroundColor: "#003049" }}
            >
              Create Request
            </button>
        </div>

        {/* My Requests */}
        <div id="track-requests" className="bg-white rounded-xl shadow-lg p-6 mb-8 scroll-mt-8">
             <h2 className="text-2xl font-bold mb-6" style={{ color: "#003049" }}>My Requests</h2>
             <div className="overflow-x-auto">
                {myRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No requests submitted yet.</p>
                ) : (
                <table className="w-full">
                    <thead>
                        <tr style={{ backgroundColor: "#003049" }}>
                            <th className="px-6 py-4 text-left text-white font-semibold">Region</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Items</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRequests.map(req => (
                            <tr key={req._id} className="border-b border-gray-200">
                                <td className="px-6 py-4 text-gray-700">{req.region}</td>
                                <td className="px-6 py-4 text-gray-700">
                                    {req.items.map((i, idx) => (
                                        <div key={idx} className="text-sm">{i.type}: {i.quantity}</div>
                                    ))}
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`px-3 py-1 text-xs font-medium rounded-full 
                                        ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                          req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                          'bg-yellow-100 text-yellow-700'}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
             </div>
        </div>

        {/* Incoming Dispatches */}
        <div id="dispatch" className="bg-white rounded-xl shadow-lg p-6 scroll-mt-8">
             <h2 className="text-2xl font-bold mb-6" style={{ color: "#003049" }}>Incoming Dispatches</h2>
             <div className="overflow-x-auto">
                {myDispatches.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No dispatches found for your requests.</p>
                ) : (
                <table className="w-full">
                    <thead>
                        <tr style={{ backgroundColor: "#003049" }}>
                            <th className="px-6 py-4 text-left text-white font-semibold">Dispatch ID</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Driver</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Vehicle</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                         {myDispatches.map(disp => (
                            <tr key={disp._id} className="border-b border-gray-200">
                                <td className="px-6 py-4 text-gray-700">#{disp._id.slice(-6).toUpperCase()}</td>
                                <td className="px-6 py-4 text-gray-700">
                                    <div>{disp.driverName}</div>
                                    <div className="text-xs text-gray-500">{disp.driverPhone}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-700">{disp.vehicleNo}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full 
                                        ${disp.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                        disp.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 
                                        'bg-yellow-100 text-yellow-700'}`}>
                                        {disp.status || "Pending"}
                                    </span>
                                </td>
                            </tr>
                         ))}
                    </tbody>
                </table>
                )}
             </div>
        </div>

       </div>

       {/* Request Modal */}
       {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
            <h3 className="text-2xl font-bold mb-6" style={{ color: "#003049" }}>
              New Supply Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>Target Region</label>
                   <input
                      type="text"
                      required
                      value={requestForm.region}
                      onChange={e => setRequestForm({...requestForm, region: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{ "--tw-ring-color": "#003049" }}
                      placeholder="e.g. North District"
                   />
                </div>
                
                <div className="space-y-3">
                    <label className="block text-sm font-semibold" style={{ color: "#003049" }}>Items Needed</label>
                    {requestForm.items.map((item, index) => (
                        <div key={index} className="flex gap-2">
                             <select
                                value={item.type}
                                onChange={e => handleItemChange(index, 'type', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                             >
                                <option value="Food">Food</option>
                                <option value="Water">Water</option>
                                <option value="Medical">Medical</option>
                                <option value="Shelter">Shelter</option>
                                <option value="Clothing">Clothing</option>
                             </select>
                             <input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                             />
                             {requestForm.items.length > 1 && (
                                 <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 font-bold px-2">&times;</button>
                             )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddItem} className="text-sm font-medium text-blue-600 hover:underline">+ Add Item</button>
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-2" style={{ color: "#003049" }}>Remarks</label>
                   <textarea
                      value={requestForm.remarks}
                      onChange={e => setRequestForm({...requestForm, remarks: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                      style={{ "--tw-ring-color": "#003049" }}
                      rows="2"
                   ></textarea>
                </div>

                <div className="flex gap-3 mt-6">
                 <button
                   type="button"
                   onClick={() => setShowRequestModal(false)}
                   className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-all hover:bg-gray-50"
                   style={{ borderColor: "#003049", color: "#003049" }}
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                   style={{ backgroundColor: "#003049" }}
                 >
                   Submit Request
                 </button>
               </div>
            </form>
          </div>
        </div>
       )}
    </div></>
  )
}
