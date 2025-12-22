import api from "../../api/axios";
import GlassCard from "../../components/ui/GlassCard";

export default function PendingUsers({ users, refresh }) {
  const approve = async (id) => {
    try {
        await api.patch(`/superadmin/approve/${id}`);
        refresh();
    } catch(e) { console.error(e); }
  };

  const reject = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
        await api.patch(`/superadmin/reject/${id}`);
        refresh();
    } catch(e) { console.error(e); }
  };

  return (
    <GlassCard className="p-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
         <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
         Pending Signup Requests
      </h2>

      {users.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
            <span className="text-4xl block mb-4 opacity-50">✨</span>
            <p>No valid requests pending approval.</p>
        </div>
      ) : (
        <div className="grid gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {users.map(user => (
            <div key={user._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-full flex items-center justify-center font-bold border border-white/10 group-hover:scale-110 transition-transform">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                </div>
                <div className="mt-3 ml-12 flex items-center gap-2">
                   <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Requested Role:</span>
                   <span className="inline-block px-2 py-0.5 text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-500/30 rounded capitalize">
                     {user.requestedRole}
                   </span>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => approve(user._id)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>✓</span> Approve
                </button>
                <button
                  onClick={() => reject(user._id)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/30 hover:border-red-500/50 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>✕</span> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
