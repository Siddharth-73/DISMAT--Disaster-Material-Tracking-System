import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import DashboardLayout from "../layouts/DashboardLayout";

export default function NGODashboard() {
  const { data, fetchDashboardData, user } = useAuth()
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestForm, setRequestForm] = useState({
    region: "",
    items: [{ materialName: "Food", quantity: "" }], 
    remarks: ""
  })
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Handlers
  const handleAddItem = () => {
    setRequestForm({
        ...requestForm,
        items: [...requestForm.items, { materialName: "Food", quantity: "" }]
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
      // Backend expects: items: [{ materialName: String, quantity: Number }]
      await api.post("/requests", requestForm)
      setMessage({ text: "Request submitted successfully", type: "success" })
      setShowRequestModal(false)
      fetchDashboardData()
      setRequestForm({ region: "", items: [{ materialName: "Food", quantity: "" }], remarks: "" })
    } catch (err) {
       console.error(err)
       setMessage({ text: err.response?.data?.message || "Failed to submit request", type: "error" })
    }
  }

  const myRequests = data.requests || []
  // Filter dispatches related to my requests
  const myDispatches = data.dispatches.filter(d => 
      myRequests.some(r => r._id === (d.request._id || d.request)) 
  )

  return (
    <DashboardLayout>
       {/* Page Header */}
       <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-[#003049] dark:text-white">
          NGO Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Request materials and track dispatches</p>
      </div>

        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}>
            {message.text}
            <button onClick={() => setMessage({ text: "", type: "" })} className="float-right font-bold">&times;</button>
          </div>
        )}

        {/* Create Request CTA */}
        <div id="create-request" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold mb-2 text-[#003049] dark:text-white">Need Supplies?</h2>
                <p className="text-gray-600 dark:text-gray-400">Submit a new request for relief materials.</p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 shadow-lg bg-[#003049] dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Create Request
            </button>
        </div>

        {/* My Requests */}
        <div id="track-requests" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 scroll-mt-8">
             <h2 className="text-2xl font-bold mb-6 text-[#003049] dark:text-white">My Requests</h2>
             <div className="overflow-x-auto">
                {myRequests.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No requests submitted yet.</p>
                ) : (
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#003049] dark:bg-slate-900">
                            <th className="px-6 py-4 text-left text-white font-semibold">Region</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Items</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRequests.map(req => {
                            const status = req.status?.toLowerCase() || 'pending';
                            return (
                            <tr key={req._id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{req.region}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                    {req.items.map((i, idx) => (
                                        <div key={idx} className="text-sm">
                                            {/* Support both schema versions just in case */}
                                            {i.materialName || i.type}: {i.quantity}
                                        </div>
                                    ))}
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`px-3 py-1 text-xs font-medium rounded-full uppercase
                                        ${status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                                          status === 'denied' || status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
                )}
             </div>
        </div>

        {/* Incoming Dispatches */}
        <div id="dispatch" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 scroll-mt-8">
             <h2 className="text-2xl font-bold mb-6 text-[#003049] dark:text-white">Incoming Dispatches</h2>
             <div className="overflow-x-auto">
                {myDispatches.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No dispatches found for your requests.</p>
                ) : (
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#003049] dark:bg-slate-900">
                            <th className="px-6 py-4 text-left text-white font-semibold">Dispatch ID</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Driver</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Vehicle</th>
                            <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                         {myDispatches.map(disp => (
                            <tr key={disp._id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">#{disp._id.slice(-6).toUpperCase()}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                    <div>{disp.driverName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{disp.driverPhone}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{disp.vehicleNo}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full 
                                        ${disp.status === 'completed' || disp.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-bold' : 
                                        disp.status === 'in_transit' || disp.status === 'In Transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                        {disp.status === 'completed' ? 'Delivered' : disp.status || "Pending"}
                                    </span>
                                </td>
                            </tr>
                         ))}
                    </tbody>
                </table>
                )}
             </div>
        </div>

       {/* Request Modal */}
       {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-xl font-bold">&times;</button>
            <h3 className="text-2xl font-bold mb-6 text-[#003049] dark:text-white">
              New Supply Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">Target Region</label>
                   <input
                      type="text"
                      required
                      value={requestForm.region}
                      onChange={e => setRequestForm({...requestForm, region: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                      style={{ "--tw-ring-color": "#003049" }}
                      placeholder="e.g. North District"
                   />
                </div>
                
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-[#003049] dark:text-gray-300">Items Needed</label>
                    {requestForm.items.map((item, index) => (
                        <div key={index} className="flex gap-2">
                             <select
                                value={item.materialName} 
                                onChange={e => handleItemChange(index, 'materialName', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
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
                                className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                             />
                             {requestForm.items.length > 1 && (
                                 <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 font-bold px-2">&times;</button>
                             )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddItem} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">+ Add Item</button>
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-2 text-[#003049] dark:text-gray-300">Remarks</label>
                   <textarea
                      value={requestForm.remarks}
                      onChange={e => setRequestForm({...requestForm, remarks: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-700 dark:text-white"
                      style={{ "--tw-ring-color": "#003049" }}
                      rows="2"
                   ></textarea>
                </div>

                <div className="flex gap-3 mt-6">
                 <button
                   type="button"
                   onClick={() => setShowRequestModal(false)}
                   className="flex-1 px-6 py-3 border-2 rounded-lg font-semibold transition-all hover:bg-gray-50 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-gray-300"
                   style={{ borderColor: "#003049", color: "#003049" }}
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 bg-[#003049] dark:bg-blue-600 dark:hover:bg-blue-500"
                 >
                   Submit Request
                 </button>
               </div>
            </form>
          </div>
        </div>
       )}
    </DashboardLayout>
  )
}
