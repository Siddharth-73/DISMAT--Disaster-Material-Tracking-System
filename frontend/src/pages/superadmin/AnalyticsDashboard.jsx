import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/analytics");
        setData(data);
      } catch (error) {
        console.error("Fetch analytics error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003049]"></div>
      </div>
    );
  }
  
  if (!data) return <div className="text-center p-10 text-gray-500">No analytics data available.</div>;

  const { requestStats, dispatchStats, userStats, requestTrends, stockStats } = data;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#003049] to-[#024a6e] p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">System Overview</h2>
          <p className="text-blue-100">Real-time insights and performance metrics.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform origin-bottom-right"></div>
      </div>

      {/* Stats Cards - Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            Requests Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={requestStats}
                dataKey="count"
                nameKey="_id"
                cx="50%" cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {requestStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Dispatch Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
             <span className="w-2 h-8 bg-green-500 rounded-full"></span>
             Dispatch Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dispatchStats}
                dataKey="count"
                nameKey="_id"
                cx="50%" cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {dispatchStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Role Distribution */}
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
            User Distribution by Role
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={userStats} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="_id" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontWeight: 600}} />
                  <Tooltip 
                     cursor={{fill: '#F3F4F6'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#8884d8" radius={[0, 8, 8, 0]} barSize={40}>
                     {userStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Request Trends Line Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Request Trends (Last 7 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={requestTrends}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff7300" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ff7300" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="count" stroke="#ff7300" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" name="Requests" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Warehouse Stock Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Warehouse Stock Levels</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
              <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="totalStock" fill="#82ca9d" radius={[8, 8, 0, 0]} name="Total Units" barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
