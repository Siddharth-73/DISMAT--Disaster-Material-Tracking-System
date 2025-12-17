import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function UserCharts({ users }) {
  const rolesCount = {};

  users.forEach(u => {
    rolesCount[u.role] = (rolesCount[u.role] || 0) + 1;
  });

  const data = Object.keys(rolesCount).map(role => ({
    name: role,
    value: rolesCount[role]
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff6b6b"];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-3">Users by Role</h2>

      <PieChart width={300} height={250}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}
