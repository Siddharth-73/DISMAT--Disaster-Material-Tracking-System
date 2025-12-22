import GlassCard from "../../components/ui/GlassCard";

export default function SuperAdminStats({ counts }) {
  const stats = [
    { label: "Total Users", value: counts.users || 0, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Pending", value: counts.pending || 0, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Warehouses", value: counts.warehouses || 0, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Requests", value: counts.requests || 0, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <GlassCard key={i} className={`p-4 text-center ${stat.bg} ${stat.border}`}>
          <h3 className={`text-3xl font-bold ${stat.color} mb-1 drop-shadow-sm`}>{stat.value}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
        </GlassCard>
      ))}
    </div>
  );
}
