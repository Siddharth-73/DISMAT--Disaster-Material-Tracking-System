import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import GlassCard from '../components/ui/GlassCard';

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Data States
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [sourceData, setSourceData] = useState([]); // Top Sources
  
  // KPI States
  const [totalArticles, setTotalArticles] = useState(0);
  const [timeSpan, setTimeSpan] = useState("N/A");
  const [topDisasterType, setTopDisasterType] = useState("N/A");
  const [uniqueSourcesCount, setUniqueSourcesCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Increased max to 100 to get better trends over time
        const res = await fetch(
          "https://gnews.io/api/v4/search?q=flood OR earthquake OR cyclone OR landslide&lang=en&country=in&max=100&apikey=f5ae72b413aa9d62cfaad001e0f46279"
        );

        if (!res.ok) throw new Error("Failed to fetch data");

        const result = await res.json();
        processData(result.articles || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const processData = (articles) => {
    setTotalArticles(articles.length);

    if (articles.length === 0) return;

    // --- 1. KPI: Time Span ---
    const dates = articles.map(a => new Date(a.publishedAt).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Format: "DD MMM - DD MMM YYYY"
    const formatDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setTimeSpan(`${formatDate(minDate)} - ${formatDate(maxDate)}`);

    // --- 2. Disaster Types (Pie & Top Type KPI) ---
    const types = { Flood: 0, Earthquake: 0, Cyclone: 0, Landslide: 0 };
    
    articles.forEach((article) => {
      const text = (article.title + " " + article.description).toLowerCase();
      if (text.includes("flood")) types.Flood++;
      if (text.includes("earthquake")) types.Earthquake++;
      if (text.includes("cyclone")) types.Cyclone++;
      if (text.includes("landslide")) types.Landslide++;
    });

    // Determine Top Reported Type
    const maxType = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b);
    setTopDisasterType(types[maxType] > 0 ? maxType : "None");

    const pData = Object.keys(types)
      .filter((key) => types[key] > 0)
      .map((key) => ({ name: key, value: types[key] }));
    
    setPieData(pData);

    // --- 3. Monthly Trends (Line Chart) ---
    const months = {};
    articles.forEach((article) => {
      const date = new Date(article.publishedAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Oct 2024"
      months[monthYear] = (months[monthYear] || 0) + 1;
    });

    // Make sure months are sorted chronologically
    const lData = Object.keys(months)
        .map(key => ({ 
            name: key, 
            count: months[key], 
            _dateVal: new Date("1 " + key).getTime() 
        }))
        .sort((a, b) => a._dateVal - b._dateVal);

    setLineData(lData);

    // --- 4. Top Sources (Bar Chart & Unique Sources KPI) ---
    const sourceCounts = {};
    articles.forEach(a => {
        const sName = a.source.name || "Unknown";
        sourceCounts[sName] = (sourceCounts[sName] || 0) + 1;
    });

    setUniqueSourcesCount(Object.keys(sourceCounts).length);

    const sData = Object.entries(sourceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5
    
    setSourceData(sData);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen font-sans text-slate-100 bg-[#0f172a] relative">
       {/* Background */}
       <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
       </div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link
            to="/"
            className="text-2xl font-bold text-white tracking-tight hover:opacity-80 transition-opacity"
            >
            DISMAT
            </Link>
            <Link
            to="/"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            >
            ← Back to Home
            </Link>
        </div>
      </header>

      <div className="pt-32 px-4 pb-20 relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Disaster Reporting Analytics
            </h1>
            <p className="text-xl text-slate-400">
            Analyzing patterns in recent disaster-related news coverage
            </p>
        </div>

        {loading ? (
            <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-xl text-slate-300">Loading disaster statistics...</p>
            </div>
        ) : error ? (
            <div className="text-center py-20">
                 <p className="text-xl text-red-400">Unable to load disaster statistics at the moment</p>
            </div>
        ) : (
          <>
            {/* KPI CARDS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <GlassCard className="p-8 text-center" delay={0.1}>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Articles</p>
                    <h3 className="text-5xl font-extrabold text-blue-400">{totalArticles}</h3>
                </GlassCard>
                <GlassCard className="p-8 text-center" delay={0.2}>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Most Reported Type</p>
                    <h3 className="text-5xl font-extrabold text-red-400">{topDisasterType}</h3>
                </GlassCard>
                <GlassCard className="p-8 text-center" delay={0.3}>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Unique Sources</p>
                    <h3 className="text-5xl font-extrabold text-emerald-400">{uniqueSourcesCount}</h3>
                </GlassCard>
            </div>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* Pie Chart */}
              <GlassCard className="p-8" delay={0.4}>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">Disaster Type Distribution</h3>
                <p className="text-slate-400 text-sm text-center mb-8">Proportion of articles by disaster category</p>
                {pieData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
                          ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-20">No data available.</p>
                )}
              </GlassCard>

              {/* Line Chart */}
              <GlassCard className="p-8" delay={0.5}>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">Monthly Reporting Trend</h3>
                <p className="text-slate-400 text-sm text-center mb-8">Volume of disaster articles over time</p>
                {lineData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis allowDecimals={false} stroke="#94a3b8" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="count" stroke="#f43f5e" strokeWidth={3} activeDot={{ r: 8, fill: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-20">No data available.</p>
                )}
              </GlassCard>

            </div>

             {/* Top Sources Chart */}
             <GlassCard className="p-8 mb-12" delay={0.6}>
                <h3 className="text-2xl font-bold text-white mb-2 text-center">Top News Sources</h3>
                <p className="text-slate-400 text-sm text-center mb-8">Most active publishers in this dataset</p>
                {sourceData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sourceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={150} tick={{fill: '#cbd5e1'}} />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" barSize={20} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                    <p className="text-center text-slate-500 py-20">No data available.</p>
                )}
             </GlassCard>

            {/* DISCLAIMER */}
            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <p className="flex items-center gap-4 text-blue-200 text-sm font-medium">
                    <span className="text-2xl">ℹ️</span>
                    These statistics are derived from publicly reported disaster-related news articles and represent media reporting trends, not official disaster records.
                </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
