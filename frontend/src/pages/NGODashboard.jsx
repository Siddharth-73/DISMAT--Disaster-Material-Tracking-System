import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"
import DashboardLayout from "../layouts/DashboardLayout";
import GlassCard from "../components/ui/GlassCard";

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
      d.request && myRequests.some(r => r._id === (d.request._id || d.request)) 
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
        <GlassCard id="create-request" className="p-6 mb-8 flex items-center justify-between relative overflow-hidden group border-blue-500/30" delay={0.1}>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-9xl">📝</span>
            </div>
            <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 text-white">Need Supplies?</h2>
                <p className="text-slate-400">Submit a new request for relief materials.</p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] bg-blue-600 hover:bg-blue-500 relative z-10"
            >
              Create Request
            </button>
        </GlassCard>

        {/* My Requests */}
        <GlassCard id="track-requests" className="p-6 mb-8 scroll-mt-8" delay={0.2}>
             <h2 className="text-2xl font-bold mb-6 text-white">My Requests</h2>
             <div className="overflow-x-auto">
                {myRequests.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No requests submitted yet.</p>
                ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 sticky top-0 z-10 bg-obsidian-foreground/50 backdrop-blur-md">
                            <th className="px-6 py-4 text-left text-slate-300 font-semibold">Region</th>
                            <th className="px-6 py-4 text-left text-slate-300 font-semibold">Items</th>
                            <th className="px-6 py-4 text-left text-slate-300 font-semibold">Status</th>
                            <th className="px-6 py-4 text-left text-slate-300 font-semibold">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {myRequests.map(req => {
                            const status = req.status?.toLowerCase() || 'pending';
                            return (
                            <tr key={req._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{req.region}</td>
                                <td className="px-6 py-4 text-slate-300">
                                    {req.items.map((i, idx) => (
                                        <div key={idx} className="text-sm">
                                            <span className="bg-white/10 px-2 py-1 rounded text-xs mr-2 border border-white/5">{i.materialName || i.type}</span>
                                            <span className="font-mono text-blue-300">{i.quantity}</span>
                                        </div>
                                    ))}
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`px-3 py-1 text-xs font-medium rounded-full uppercase border 
                                        ${status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                                          status === 'denied' || status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 
                                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
                )}
             </div>
        </GlassCard>

        {/* Incoming Dispatches */}
        <GlassCard id="dispatch" className="p-6 scroll-mt-8" delay={0.3}>
             <h2 className="text-2xl font-bold mb-6 text-white">Incoming Dispatches</h2>
             <div className="overflow-x-auto">
                {myDispatches.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No dispatches found for your requests.</p>
                ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 sticky top-0 z-10 bg-obsidian-foreground/50 backdrop-blur-md">
                            <th className="px-6 py-4 text-left text-slate-300 font-semibold">Dispatch ID</th>
                            <th className="px-6 py-4 text-left text-slate-300 font-semibold">Driver</th>
                            <th className="px-6 py-4 text-left text-slate-300 font-semibold">Vehicle</th>
                            <th className="px-6 py-4 text-left text-slate-300 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                         {myDispatches.map(disp => (
                            <tr key={disp._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-slate-300 font-mono text-xs">#{disp._id.slice(-6).toUpperCase()}</td>
                                <td className="px-6 py-4 text-slate-300">
                                    <div className="text-white font-medium">{disp.driverName}</div>
                                    <div className="text-xs text-slate-500">{disp.driverPhone}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-300 font-mono">{disp.vehicleNo}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border
                                        ${disp.status === 'completed' || disp.status === 'Delivered' ? 'bg-green-500/20 text-green-300 border-green-500/30 font-bold' : 
                                        disp.status === 'in_transit' || disp.status === 'In Transit' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 
                                        'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                                        {disp.status === 'completed' ? 'Delivered' : disp.status || "Pending"}
                                    </span>
                                </td>
                            </tr>
                         ))}
                    </tbody>
                </table>
                )}
             </div>
        </GlassCard>

       {/* Request Modal */}
       {showRequestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto" delay={0}>
             <button 
                onClick={() => setShowRequestModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
            <h3 className="text-2xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              New Supply Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold mb-2 text-slate-300">Target Region</label>
                   <input
                      type="text"
                      required
                      value={requestForm.region}
                      onChange={e => setRequestForm({...requestForm, region: e.target.value})}
                      className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                      placeholder="e.g. North District"
                   />
                </div>
                
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-300">Items Needed</label>
                    {requestForm.items.map((item, index) => (
                        <div key={index} className="flex gap-2">
                             <select
                                value={item.materialName} 
                                onChange={e => handleItemChange(index, 'materialName', e.target.value)}
                                className="flex-1 px-3 py-2 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                             >
                                <option value="Food" className="bg-slate-800">Food</option>
                                <option value="Water" className="bg-slate-800">Water</option>
                                <option value="Medical" className="bg-slate-800">Medical</option>
                                <option value="Shelter" className="bg-slate-800">Shelter</option>
                                <option value="Clothing" className="bg-slate-800">Clothing</option>
                             </select>
                             <input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-24 px-3 py-2 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
                             />
                             {requestForm.items.length > 1 && (
                                 <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-300 font-bold px-2">&times;</button>
                             )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddItem} className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline">+ Add Item</button>
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-2 text-slate-300">Remarks</label>
                   <textarea
                      value={requestForm.remarks}
                      onChange={e => setRequestForm({...requestForm, remarks: e.target.value})}
                      className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                      rows="2"
                   ></textarea>
                </div>

                <div className="flex gap-3 mt-6">
                 <button
                   type="button"
                   onClick={() => setShowRequestModal(false)}
                   className="flex-1 px-6 py-3 border border-white/10 rounded-lg font-semibold text-slate-300 hover:bg-white/5 transition-all"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all transform active:scale-95"
                 >
                   Submit Request
                 </button>
               </div>
            </form>
          </GlassCard>
        </div>
       )}
    </DashboardLayout>
  )
}
