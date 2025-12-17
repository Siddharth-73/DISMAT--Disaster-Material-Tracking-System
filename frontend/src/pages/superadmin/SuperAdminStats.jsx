export default function SuperAdminStats({ users, pending }) {
  const active = users.filter(u => u.status === "active").length;
  const blocked = users.filter(u => u.status === "blocked").length;

  return (
    <div className="grid grid-cols-4 gap-4">
      <Stat title="Total Users" value={users.length} />
      <Stat title="Pending Requests" value={pending.length} />
      <Stat title="Active Users" value={active} />
      <Stat title="Blocked Users" value={blocked} />
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
