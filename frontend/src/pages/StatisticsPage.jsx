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
    // GNews returns by relevance/date. Let's find min and max date.
    const dates = articles.map(a => new Date(a.publishedAt).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Format: "DD MMM - DD MMM YYYY" if same year, else include year
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#fdf0d5", minHeight: "100vh", paddingBottom: "40px" }}>
      {/* Navbar */}
      <header
        style={{
          padding: "12px 40px",
          backgroundColor: "#003049",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "white",
            textDecoration: "none",
          }}
        >
          DISMAT
        </Link>
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          ← Back to Home
        </Link>
      </header>

      <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: "#003049", fontSize: "36px", fontWeight: "700", marginBottom: "10px" }}>
          Disaster Reporting Analytics
        </h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "50px", fontSize: "16px" }}>
          Analyzing patterns in recent disaster-related news coverage
        </p>

        {loading ? (
          <p style={{ textAlign: "center", fontSize: "18px", color: "#003049" }}>Loading disaster statistics...</p>
        ) : error ? (
          <p style={{ textAlign: "center", fontSize: "18px", color: "#c62828" }}>Unable to load disaster statistics at the moment</p>
        ) : (
          <>
            {/* KPI CARDS SECTION */}
            <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
                gap: "20px", 
                marginBottom: "40px" 
            }}>
                <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>Total Articles Analyzed</p>
                    <h3 style={kpiValueStyle}>{totalArticles}</h3>
                </div>
                <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>Most Reported Type</p>
                    <h3 style={{...kpiValueStyle, color: "#d62828"}}>{topDisasterType}</h3>
                </div>
                <div style={kpiCardStyle}>
                    <p style={kpiLabelStyle}>Unique News Sources</p>
                    <h3 style={kpiValueStyle}>{uniqueSourcesCount}</h3>
                </div>
            </div>

            {/* CHARTS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "40px", marginBottom: "40px" }}>
              
              {/* Pie Chart */}
              <div style={chartCardStyle}>
                <h3 style={chartTitleStyle}>Disaster Type Distribution</h3>
                <p style={chartSubTitleStyle}>Proportion of articles by disaster category</p>
                {pieData.length > 0 ? (
                  <div style={{ height: "300px" }}>
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
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", color: "#999" }}>No data available.</p>
                )}
              </div>

              {/* Line Chart */}
              <div style={chartCardStyle}>
                <h3 style={chartTitleStyle}>Monthly Reporting Trend</h3>
                <p style={chartSubTitleStyle}>Volume of disaster articles over time</p>
                {lineData.length > 0 ? (
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#003049" />
                        <YAxis allowDecimals={false} stroke="#003049" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#d62828" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", color: "#999" }}>No data available.</p>
                )}
              </div>

            </div>

             {/* Top Sources Chart (New Section) */}
             <div style={{...chartCardStyle, marginBottom: "40px" }}>
                <h3 style={chartTitleStyle}>Top News Sources Reporting Disasters</h3>
                <p style={chartSubTitleStyle}>Most active publishers in this dataset</p>
                {sourceData.length > 0 ? (
                  <div style={{ height: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sourceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" stroke="#003049" allowDecimals={false} />
                        <YAxis dataKey="name" type="category" stroke="#003049" width={150} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="count" fill="#003049" barSize={20} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                    <p style={{ textAlign: "center", color: "#999" }}>No data available.</p>
                )}
             </div>

            {/* REQUIRED DISCLAIMER */}
            <div style={{
                backgroundColor: "#e3f2fd",
                borderLeft: "5px solid #2196f3",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
            }}>
                <p style={{ margin: 0, color: "#0d47a1", fontWeight: "500", fontSize: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>ℹ️</span>
                    These statistics are derived from publicly reported disaster-related news articles and represent media reporting trends, not official disaster records.
                </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Styles
const kpiCardStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
    transition: "transform 0.2s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
};

const kpiLabelStyle = {
    fontSize: "14px",
    color: "#666",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "5px"
};

const kpiValueStyle = {
    fontSize: "32px",
    color: "#003049",
    fontWeight: "800",
    margin: 0
};

const chartCardStyle = {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const chartTitleStyle = {
    textAlign: "center", 
    color: "#003049", 
    fontSize: "20px", 
    fontWeight: "700", 
    marginBottom: "5px"
};

const chartSubTitleStyle = {
    textAlign: "center", 
    color: "#888", 
    fontSize: "14px", 
    marginBottom: "25px"
};

export default StatisticsPage;
