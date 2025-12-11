import React, { useEffect, useState } from "react";
import api from "../api/axios";

const LandingPage = () => {

  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    location: "",
    description: "",
  });

  // Fetch Public Stats
  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/public/stats");
      setStats(res.data);
    };
    fetchStats();
  }, []);

  // Fetch Recent Logs
  useEffect(() => {
    const fetchLogs = async () => {
      const res = await api.get("/public/logs");
      setLogs(res.data);
    };
    fetchLogs();
  }, []);

  // Submit Emergency Report
  const submitReport = async (e) => {
    e.preventDefault();
    await api.post("/public/emergency-report", form);
    alert("Emergency report submitted!");
    setForm({ name: "", contact: "", location: "", description: "" });
  };

  return (
    <div>

      {/* HEADER */}
      <header>
        <h2>DISMAT</h2>
        <nav>
          <a href="/">Home</a>{" | "}
          <a href="#safety">Safety Tips</a>{" | "}
          <a href="#contact">Contact</a>{" | "}
          <a href="/login">Login</a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section>
        <h1>Disaster Relief Material Tracking System</h1>
        <p>Transparency • Accountability • Relief to the last person</p>
      </section>

      {/* CAROUSEL (STATIC FOR NOW) */}
      <section id="safety">
        <h2>Disaster Safety Tips</h2>
        <div>
          <p>[Carousel Placeholder]</p>
          <ul>
            <li>Flood: Move to higher ground</li>
            <li>Earthquake: Drop, Cover, Hold</li>
            <li>Cyclone: Stay indoors & secure windows</li>
          </ul>
        </div>
      </section>

      {/* PUBLIC STATS */}
      <section>
        <h2>Live Relief Statistics</h2>
        <ul>
          <li>Materials Received: {stats.materialsReceived}</li>
          <li>Materials Dispatched: {stats.materialsDispatched}</li>
          <li>Materials Delivered: {stats.materialsDelivered}</li>
          <li>People Helped: {stats.peopleHelped}</li>
          <li>Active Disaster Zones: {stats.activeZones}</li>
        </ul>
      </section>

      {/* RECENT LOGS */}
      <section>
        <h2>Recent Activity</h2>
        <ul>
          {logs.map((log) => (
            <li key={log._id}>
              [{new Date(log.createdAt).toLocaleString()}] — {log.action}
            </li>
          ))}
        </ul>
      </section>

      {/* EMERGENCY REPORT FORM */}
      <section id="contact">
        <h2>Emergency Contact Form</h2>
        <form onSubmit={submitReport}>
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="text"
            placeholder="Contact Number"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />

          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <textarea
            placeholder="Describe the emergency"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button type="submit">Submit</button>
        </form>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2025 DISMAT — Disaster Relief Material Tracking System</p>
      </footer>

    </div>
  );
};

export default LandingPage;
