import api from "../../api/axios";

export default function UsersTable({ users, refresh }) {
  const block = async (id) => {
    await api.patch(`/superadmin/block/${id}`);
    refresh();
  };

  const unblock = async (id) => {
    await api.patch(`/superadmin/unblock/${id}`);
    refresh();
  };

  const changeRole = async (id, role) => {
    await api.patch(`/superadmin/role/${id}`, { role });
    refresh();
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-3">All Users</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-b text-center">
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td className="space-x-2">
                {u.status === "active" ? (
                  <button onClick={() => block(u._id)} className="text-red-600">
                    Block
                  </button>
                ) : (
                  <button onClick={() => unblock(u._id)} className="text-green-600">
                    Unblock
                  </button>
                )}

                <select
                  onChange={(e) => changeRole(u._id, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Change Role</option>
                  <option value="admin">Admin</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="ngo">NGO</option>
                  <option value="fieldworker">Fieldworker</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
