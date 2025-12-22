import api from "../../api/axios";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Pending Signup Requests</h2>

      {users.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
            <span className="text-4xl block mb-2">✨</span>
            <p>No pending requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {users.map(user => (
            <div key={user._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#003049] text-white rounded-full flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
                <div className="mt-2 ml-12">
                   <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Requested Role:</span>
                   <span className="ml-2 inline-block px-2 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded-md capitalize">
                     {user.requestedRole}
                   </span>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => approve(user._id)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>✓</span> Approve
                </button>
                <button
                  onClick={() => reject(user._id)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>✕</span> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


