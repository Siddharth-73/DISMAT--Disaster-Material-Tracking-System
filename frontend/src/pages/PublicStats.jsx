"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../../api/axios"

export default function StatsPage() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/public/stats")
        setStats(res.data)
      } catch (err) {
        console.error("Failed to fetch stats")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        backgroundColor: "#fdf0d5",
        minHeight: "100vh",
      }}
    >
      {/* Fixed Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "#003049",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding: "12px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
          }}
        >
          <Link
            to="/"
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "700",
              color: "white",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            DISMAT
          </Link>
          <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link
              to="/"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Home
            </Link>
            <Link
              to="/login"
              style={{
                color: "#003049",
                backgroundColor: "white",
                textDecoration: "none",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                transition: "transform 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <div style={{ paddingTop: "60px" }}>
        {/* Hero Section */}
        <section
          style={{
            padding: "60px 40px",
            textAlign: "center",
            backgroundColor: "#003049",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              margin: "0 0 16px 0",
            }}
          >
            Live Relief Statistics
          </h1>
          <p style={{ fontSize: "18px", margin: 0, opacity: 0.9 }}>Real-time data from disaster relief operations</p>
        </section>

        {/* Statistics Dashboard */}
        <section style={{ padding: "60px 40px", maxWidth: "1400px", margin: "0 auto" }}>
          {loading ? (
            <p style={{ textAlign: "center", fontSize: "18px", color: "#003049" }}>Loading statistics...</p>
          ) : (
            <>
              {/* Main Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "24px",
                  marginBottom: "60px",
                }}
              >
                {[
                  {
                    label: "Materials Received",
                    value: stats.materialsReceived || 0,
                    icon: "📦",
                    color: "#003049",
                  },
                  {
                    label: "Materials Dispatched",
                    value: stats.materialsDispatched || 0,
                    icon: "🚚",
                    color: "#0066cc",
                  },
                  {
                    label: "Materials Delivered",
                    value: stats.materialsDelivered || 0,
                    icon: "✅",
                    color: "#4caf50",
                  },
                  {
                    label: "People Helped",
                    value: stats.peopleHelped || 0,
                    icon: "👥",
                    color: "#ff9800",
                  },
                  {
                    label: "Active Disaster Zones",
                    value: stats.activeZones || 0,
                    icon: "🗺️",
                    color: "#f44336",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "white",
                      padding: "32px",
                      borderRadius: "16px",
                      textAlign: "center",
                      boxShadow: "0 4px 16px rgba(0,48,73,0.1)",
                      transition: "all 0.3s ease",
                      border: `3px solid ${stat.color}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)"
                      e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,48,73,0.2)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,48,73,0.1)"
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>{stat.icon}</div>
                    <div
                      style={{
                        fontSize: "56px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: stat.color,
                      }}
                    >
                      {stat.value.toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#666",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        fontWeight: "600",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Insights */}
              <div
                style={{
                  backgroundColor: "white",
                  padding: "40px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0,48,73,0.1)",
                }}
              >
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#003049",
                    marginBottom: "32px",
                    textAlign: "center",
                  }}
                >
                  Relief Distribution Overview
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "32px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>📊</div>
                    <div style={{ fontSize: "32px", fontWeight: "700", color: "#003049" }}>
                      {stats.materialsReceived && stats.materialsDispatched
                        ? ((stats.materialsDispatched / stats.materialsReceived) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>Dispatch Rate</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>🎯</div>
                    <div style={{ fontSize: "32px", fontWeight: "700", color: "#4caf50" }}>
                      {stats.materialsDispatched && stats.materialsDelivered
                        ? ((stats.materialsDelivered / stats.materialsDispatched) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>Delivery Success</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>⏱️</div>
                    <div style={{ fontSize: "32px", fontWeight: "700", color: "#ff9800" }}>
                      {stats.materialsReceived && stats.materialsDelivered
                        ? Math.max(0, stats.materialsReceived - stats.materialsDelivered)
                        : 0}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>In Transit</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: "32px 40px",
            backgroundColor: "#003049",
            color: "white",
            textAlign: "center",
            marginTop: "60px",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px" }}>© 2025 DISMAT — Disaster Relief Material Tracking System</p>
        </footer>
      </div>
    </div>
  )
}
