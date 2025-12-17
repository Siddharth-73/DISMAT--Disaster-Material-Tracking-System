import api from "../../api/axios";

export default function PendingUsers({ users, refresh }) {
  const approve = async (id) => {
    await api.patch(`/superadmin/approve/${id}`);
    refresh();
  };

  const reject = async (id) => {
    await api.patch(`/superadmin/reject/${id}`);
    refresh();
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Pending Signup Requests</h2>

      {users.length === 0 && <p>No pending users</p>}

      {users.map(user => (
        <div key={user._id} className="flex justify-between border-b py-2">
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-500">
              {user.email} | requested: {user.requestedRole}
            </p>
          </div>

          <div className="space-x-2">
            <button
              onClick={() => approve(user._id)}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Approve
            </button>
            <button
              onClick={() => reject(user._id)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


