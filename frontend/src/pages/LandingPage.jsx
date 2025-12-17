"use client";

import LiveDisasterMap from "../components/LiveDisasterMap";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const LandingPage = () => {
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSafetyIndex, setCurrentSafetyIndex] = useState(0);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    location: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const disasterSlides = [
    {
      title: "Floods",
      icon: "🌊",
      image: "/flood.jpg",
      description: "Too much water covering land",
    },
    {
      title: "Cyclones",
      icon: "🌪️",
      image: "/cyclones.jpg",
      description: "Strong winds with heavy rain",
    },
    {
      title: "Earthquakes",
      icon: "🌍",
      image: "/earthquakes.jpg",
      description: "Sudden shaking of the ground",
    },
    {
      title: "Forest Fires",
      icon: "🔥",
      image: "/forestFires.jpg",
      description: "Fire spreading in forest areas",
    },
    {
      title: "Landslides",
      icon: "🌧️",
      image: "/landslides.avif",
      description: "Land and rocks sliding down",
    },
    {
      title: "Heatwaves",
      icon: "🌡️",
      image: "/drought.jpeg",
      description: "Very hot weather for days",
    },
    {
      title: "Industrial Accidents",
      icon: "🏭",
      image: "/IndustrialAccidents.jpg",
      description: "Accidents happening inside factories",
    },
    {
      title: "Chemical Leaks",
      icon: "☢️",
      image: "/ChemicalLeaks.avif",
      description: "Dangerous chemicals leaking into air",
    },
  ];

  const comprehensiveSafetyTips = [
    {
      type: "Cyclone",
      icon: "🌀",
      image: "/cyclones.jpg",
      before: [
        "Follow official weather warnings",
        "Secure doors, windows, and roofs",
        "Trim weak trees near house",
        "Prepare emergency kit",
        "Know nearest cyclone shelter",
        "Charge phones and power banks",
      ],
      during: [
        "Stay indoors away from windows",
        "Do not go outside during calm eye",
        "Switch off electricity and gas",
        "Listen to official announcements",
        "Evacuate if instructed by authorities",
      ],
      after: [
        "Avoid fallen power lines",
        "Drink safe or boiled water",
        "Check house for damage",
        "Help injured people nearby",
        "Report damage to authorities",
      ],
    },
    {
      type: "Flood",
      icon: "🌊",
      image: "/flood.jpg",
      before: [
        "Know if area is flood-prone",
        "Move valuables to higher places",
        "Keep emergency food and water",
        "Prepare evacuation plan",
        "Store important documents safely",
      ],
      during: [
        "Move to higher ground immediately",
        "Do not walk or drive in water",
        "Switch off electricity supply",
        "Avoid contact with flood water",
        "Follow rescue team instructions",
      ],
      after: [
        "Clean and disinfect home",
        "Avoid damaged buildings",
        "Boil water before drinking",
        "Watch out for insects and snakes",
        "Apply for relief assistance",
      ],
    },
    {
      type: "Tsunami",
      icon: "🌊",
      image: "/tsunami.jpg",
      before: [
        "Know tsunami warning signs",
        "Learn evacuation routes",
        "Practice evacuation drills",
        "Follow coastal safety guidelines",
      ],
      during: [
        "Evacuate immediately after strong earthquake",
        "Move to higher ground or inland",
        "Stay away from beaches",
        "Follow official warnings",
      ],
      after: [
        "Remain alert for more waves",
        "Avoid polluted water sources",
        "Help rescue and relief efforts",
        "Return only after clearance",
      ],
    },
    {
      type: "Earthquake",
      icon: "🏚️",
      image: "/earthquakes.jpg",
      before: [
        "Secure heavy furniture and shelves",
        "Identify safe places indoors",
        "Keep emergency kit ready",
        "Practice Drop Cover Hold drill",
      ],
      during: [
        "Drop to the ground",
        "Cover under sturdy furniture",
        "Hold on until shaking stops",
        "Stay away from windows",
        "Move to open area if outside",
      ],
      after: [
        "Check yourself and others for injuries",
        "Turn off gas and electricity",
        "Be prepared for aftershocks",
        "Avoid damaged buildings",
        "Assist neighbors if safe",
      ],
    },
    {
      type: "Landslide",
      icon: "⛰️",
      image: "/landslides.avif",
      before: [
        "Avoid staying near steep slopes",
        "Ensure proper water drainage",
        "Watch for cracks on ground",
        "Follow heavy rainfall warnings",
      ],
      during: [
        "Move away from landslide path",
        "Do not cross affected areas",
        "Listen to emergency alerts",
        "Evacuate immediately if advised",
      ],
      after: [
        "Stay away from unstable slopes",
        "Report blocked roads or damage",
        "Help injured people",
        "Support cleanup efforts",
      ],
    },
    {
      type: "Heatwave",
      icon: "🌡️",
      image: "/drought.jpeg",
      before: [
        "Drink plenty of water",
        "Avoid outdoor activities at noon",
        "Wear light and loose clothing",
        "Check weather heat alerts",
      ],
      during: [
        "Stay indoors or in shade",
        "Drink water frequently",
        "Avoid heavy physical work",
        "Check elderly and children",
      ],
      after: [
        "Continue hydration",
        "Seek medical help if unwell",
        "Review heat safety measures",
      ],
    },
    {
      type: "Forest Fire",
      icon: "🔥",
      image: "/forestFires.jpg",
      before: [
        "Avoid open fires in forests",
        "Clear dry leaves near homes",
        "Follow fire safety warnings",
        "Prepare evacuation plan",
      ],
      during: [
        "Move away from fire direction",
        "Cover nose and mouth from smoke",
        "Follow evacuation orders",
        "Do not enter forest areas",
      ],
      after: [
        "Avoid burnt areas",
        "Check air quality",
        "Help affected communities",
        "Report remaining fire spots",
      ],
    },
    {
      type: "Industrial Accident",
      icon: "🏭",
      image: "/IndustrialAccidents.jpg",
      before: [
        "Know emergency exits",
        "Follow workplace safety rules",
        "Participate in safety drills",
        "Wear protective equipment",
      ],
      during: [
        "Evacuate immediately if alarm sounds",
        "Avoid affected area",
        "Follow safety officers instructions",
        "Do not panic",
      ],
      after: [
        "Seek medical help if exposed",
        "Report incident details",
        "Follow official safety updates",
      ],
    },
    {
      type: "Chemical Leak",
      icon: "☢️",
      image: "/ChemicalLeaks.avif",
      before: [
        "Know chemical hazard symbols",
        "Identify safe shelter areas",
        "Follow safety instructions",
        "Keep emergency contacts ready",
      ],
      during: [
        "Move away from leak area",
        "Cover nose and mouth",
        "Stay indoors if advised",
        "Follow emergency announcements",
      ],
      after: [
        "Wash exposed skin thoroughly",
        "Seek medical attention",
        "Avoid contaminated areas",
        "Wait for official clearance",
      ],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % disasterSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Public Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/PublicStats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Replace with your actual news API endpoint
        // Example: NewsAPI, GNews, or your backend endpoint
        const res = await api.get("/public/disaster-news");
        setNewsArticles(res.data);
      } catch (err) {
        console.error("Failed to fetch news");
        // Fallback mock data for demonstration
        setNewsArticles([
          {
            id: 1,
            title: "Earthquake hits southern region, relief efforts underway",
            source: "National Disaster Management",
            publishedAt: new Date().toISOString(),
            url: "#",
            image: "/earthquake-rescue-operations.jpg",
          },
          {
            id: 2,
            title: "Cyclone warning issued for coastal areas",
            source: "Weather Department",
            publishedAt: new Date(Date.now() - 86400000).toISOString(),
            url: "#",
            image: "/cyclone-storm-warning.jpg",
          },
          {
            id: 3,
            title: "Flood relief materials dispatched to affected villages",
            source: "Relief Department",
            publishedAt: new Date(Date.now() - 172800000).toISOString(),
            url: "#",
            image: "/placeholder.svg?height=200&width=300",
          },
        ]);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  // Fetch Recent Logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/public/logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs");
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  // Submit Emergency Report
  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await api.post("/public/emergency-report", form);
      setMessage("Emergency report submitted successfully.");
      setForm({ name: "", contact: "", location: "", description: "" });
    } catch (err) {
      setMessage("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextSafetyTip = () => {
    setCurrentSafetyIndex(
      (prev) => (prev + 1) % comprehensiveSafetyTips.length
    );
    setSelectedDisaster(null);
  };

  const prevSafetyTip = () => {
    setCurrentSafetyIndex((prev) =>
      prev === 0 ? comprehensiveSafetyTips.length - 1 : prev - 1
    );
    setSelectedDisaster(null);
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        lineHeight: "1.6",
        backgroundColor: "#fdf0d5",
        minHeight: "100vh",
      }}
    >
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
            <a
              href="#safety"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Safety Tips
            </a>
            <Link
              to="/PublicStats"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Statistics
            </Link>
            <a
              href="#contact"
              style={{
                color: "white",
                textDecoration: "none",
                fontSize: "14px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Emergency
            </a>
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <div style={{ paddingTop: "60px" }}>
        {/* HERO */}
        <section
          style={{
            padding: "10px 0px 20px",
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
              lineHeight: "1.2",
            }}
          >
            Disaster Relief Material Tracking System
          </h1>
          <p
            style={{
              fontSize: "20px",
              margin: 0,
              opacity: 0.9,
              fontWeight: "300",
            }}
          >
            Transparency • Accountability • Relief to the last person
          </p>
        </section>

        <section
          style={{ padding: "0px 10px 20px", backgroundColor: "#003049" }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "5px",
              color: "white",
              textAlign: "center",
            }}
          >
            Disasters We Monitor
          </h2>
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {disasterSlides.map((slide, index) => (
              <div
                key={index}
                style={{
                  display: index === currentSlide ? "block" : "none",
                  position: "relative",
                }}
              >
                <img
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                    padding: "40px 32px 24px",
                    color: "white",
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "8px" }}>
                    {slide.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "32px",
                      fontWeight: "700",
                      margin: "0 0 8px 0",
                    }}
                  >
                    {slide.title}
                  </h3>
                  <p style={{ fontSize: "16px", margin: 0, opacity: 0.9 }}>
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Slide indicators */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "8px",
                zIndex: 10,
              }}
            >
              {disasterSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor:
                      index === currentSlide
                        ? "white"
                        : "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
        <section style={{ padding: "60px 40px", backgroundColor: "#fdf0d5" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "24px",
              color: "#003049",
              textAlign: "center",
            }}
          >
            Live Disaster Map
          </h2>

          <p
            style={{
              textAlign: "center",
              marginBottom: "24px",
              color: "#555",
            }}
          >
            Real-time overview of active disaster zones across the country
          </p>

          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <LiveDisasterMap />
          </div>
        </section>

        <section
          id="safety"
          style={{ padding: "60px 40px", maxWidth: "1200px", margin: "0 auto" }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "40px",
              color: "#003049",
              textAlign: "center",
            }}
          >
            Disaster Safety Guidelines
          </h2>

          <div style={{ position: "relative" }}>
            {/* Carousel container */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0 8px 24px rgba(0,48,73,0.12)",
                minHeight: "500px",
              }}
            >
              {!selectedDisaster ? (
                // Carousel view
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-block",
                      marginBottom: "24px",
                    }}
                  >
                    <img
                      src={
                        comprehensiveSafetyTips[currentSafetyIndex].image ||
                        "/placeholder.svg"
                      }
                      alt={comprehensiveSafetyTips[currentSafetyIndex].type}
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "300px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(0,48,73,0.15)",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                    {comprehensiveSafetyTips[currentSafetyIndex].icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "32px",
                      fontWeight: "700",
                      color: "#003049",
                      marginBottom: "24px",
                    }}
                  >
                    {comprehensiveSafetyTips[currentSafetyIndex].type}
                  </h3>
                  <button
                    onClick={() =>
                      setSelectedDisaster(
                        comprehensiveSafetyTips[currentSafetyIndex]
                      )
                    }
                    style={{
                      padding: "14px 32px",
                      fontSize: "16px",
                      fontWeight: "600",
                      backgroundColor: "#003049",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#00416b";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#003049";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    View Safety Guidelines
                  </button>
                </div>
              ) : (
                // Detailed view
                <div>
                  <button
                    onClick={() => setSelectedDisaster(null)}
                    style={{
                      marginBottom: "24px",
                      padding: "8px 16px",
                      fontSize: "14px",
                      backgroundColor: "#f0f0f0",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e0e0e0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0f0f0")
                    }
                  >
                    ← Back to Carousel
                  </button>

                  <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                      {selectedDisaster.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: "32px",
                        fontWeight: "700",
                        color: "#003049",
                        margin: 0,
                      }}
                    >
                      {selectedDisaster.type}
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {/* Before */}
                    <div
                      style={{
                        backgroundColor: "#e8f4f8",
                        padding: "24px",
                        borderRadius: "12px",
                        border: "2px solid #003049",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#003049",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>✅</span> Before
                        (Preparedness)
                      </h4>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "20px",
                          color: "#333",
                        }}
                      >
                        {selectedDisaster.before.map((tip, i) => (
                          <li
                            key={i}
                            style={{
                              marginBottom: "8px",
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* During */}
                    <div
                      style={{
                        backgroundColor: "#fff3e0",
                        padding: "24px",
                        borderRadius: "12px",
                        border: "2px solid #ff9800",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#ff9800",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>⚠️</span> During
                        (What to Do)
                      </h4>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "20px",
                          color: "#333",
                        }}
                      >
                        {selectedDisaster.during.map((tip, i) => (
                          <li
                            key={i}
                            style={{
                              marginBottom: "8px",
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* After */}
                    <div
                      style={{
                        backgroundColor: "#f1f8e9",
                        padding: "24px",
                        borderRadius: "12px",
                        border: "2px solid #4caf50",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#4caf50",
                          marginBottom: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>🔁</span> After
                        (Recovery)
                      </h4>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "20px",
                          color: "#333",
                        }}
                      >
                        {selectedDisaster.after.map((tip, i) => (
                          <li
                            key={i}
                            style={{
                              marginBottom: "8px",
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation arrows */}
            {!selectedDisaster && (
              <>
                <button
                  onClick={prevSafetyTip}
                  style={{
                    position: "absolute",
                    left: "-20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#003049",
                    color: "white",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,48,73,0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#00416b";
                    e.currentTarget.style.transform =
                      "translateY(-50%) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#003049";
                    e.currentTarget.style.transform =
                      "translateY(-50%) scale(1)";
                  }}
                  aria-label="Previous disaster"
                >
                  ‹
                </button>
                <button
                  onClick={nextSafetyTip}
                  style={{
                    position: "absolute",
                    right: "-20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#003049",
                    color: "white",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,48,73,0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#00416b";
                    e.currentTarget.style.transform =
                      "translateY(-50%) scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#003049";
                    e.currentTarget.style.transform =
                      "translateY(-50%) scale(1)";
                  }}
                  aria-label="Next disaster"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Indicator dots */}
          {!selectedDisaster && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              {comprehensiveSafetyTips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSafetyIndex(index);
                    setSelectedDisaster(null);
                  }}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "2px solid #003049",
                    backgroundColor:
                      index === currentSafetyIndex ? "#003049" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label={`Go to ${comprehensiveSafetyTips[index].type}`}
                />
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            padding: "60px 40px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "40px",
              color: "#003049",
              textAlign: "center",
            }}
          >
            Recent Disaster News
          </h2>

          {loadingNews ? (
            <p
              style={{
                textAlign: "center",
                fontSize: "18px",
                color: "#003049",
              }}
            >
              Loading latest news...
            </p>
          ) : newsArticles.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: "18px", color: "#666" }}>
              No recent news available
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {newsArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,48,73,0.1)",
                    transition: "all 0.3s ease",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 24px rgba(0,48,73,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,48,73,0.1)";
                  }}
                >
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ padding: "20px" }}>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#003049",
                        marginBottom: "12px",
                        lineHeight: "1.4",
                      }}
                    >
                      {article.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      <span>{article.source}</span>
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* STATS */}
        <section
          id="stats"
          style={{
            padding: "60px 40px",
            backgroundColor: "#003049",
            color: "white",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            Live Relief Statistics
          </h2>

          {loadingStats ? (
            <p style={{ textAlign: "center", fontSize: "18px" }}>
              Loading statistics...
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "24px",
                maxWidth: "1200px",
                margin: "0 auto",
              }}
            >
              {[
                {
                  label: "Materials Received",
                  value: stats.materialsReceived || 0,
                },
                {
                  label: "Materials Dispatched",
                  value: stats.materialsDispatched || 0,
                },
                {
                  label: "Materials Delivered",
                  value: stats.materialsDelivered || 0,
                },
                { label: "People Helped", value: stats.peopleHelped || 0 },
                {
                  label: "Active Disaster Zones",
                  value: stats.activeZones || 0,
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    padding: "32px",
                    borderRadius: "12px",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "#fdf0d5",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      opacity: 0.9,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <br />
        <br />

        {/* RECENT ACTIVITY - keeping existing logs */}
        <section
          style={{
            padding: "60px 40px",
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "40px",
              color: "#003049",
              textAlign: "center",
            }}
          >
            Recent Activity
          </h2>

          {loadingLogs ? (
            <p
              style={{
                textAlign: "center",
                fontSize: "18px",
                color: "#003049",
              }}
            >
              Loading activity...
            </p>
          ) : logs.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: "18px", color: "#666" }}>
              No recent activity
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {logs.map((log) => (
                <div
                  key={log._id}
                  style={{
                    backgroundColor: "#fdf0d5",
                    padding: "20px 24px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,48,73,0.08)",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    transition: "all 0.2s ease",
                    borderLeft: "4px solid #003049",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,48,73,0.12)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,48,73,0.08)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div
                    style={{
                      minWidth: "8px",
                      height: "8px",
                      backgroundColor: "#003049",
                      borderRadius: "50%",
                      marginTop: "6px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "4px",
                      }}
                    >
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: "16px", color: "#003049" }}>
                      {log.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* EMERGENCY FORM */}
        <section
          id="contact"
          style={{
            padding: "60px 40px",
            backgroundColor: "#fdf0d5",
          }}
        >
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "700",
                marginBottom: "16px",
                color: "#003049",
                textAlign: "center",
              }}
            >
              Emergency Contact Form
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#666",
                marginBottom: "40px",
                fontSize: "16px",
              }}
            >
              Report an emergency and our team will respond immediately
            </p>

            <form
              onSubmit={submitReport}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                backgroundColor: "white",
                padding: "32px",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,48,73,0.1)",
              }}
            >
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#003049")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />

              <input
                type="text"
                placeholder="Contact Number"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                required
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#003049")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />

              <input
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#003049")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />

              <textarea
                placeholder="Describe the emergency"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                rows={5}
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#003049")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "16px",
                  fontSize: "18px",
                  fontWeight: "600",
                  backgroundColor: submitting ? "#ccc" : "#003049",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = "#00416b";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,48,73,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = "#003049";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                {submitting ? "Submitting..." : "Submit Emergency Report"}
              </button>

              {message && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    backgroundColor: message.includes("success")
                      ? "#e8f5e9"
                      : "#ffebee",
                    color: message.includes("success") ? "#2e7d32" : "#c62828",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  {message}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            padding: "32px 40px",
            backgroundColor: "#003049",
            color: "white",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "14px" }}>
            ©️ 2025 DISMAT — Disaster Relief Material Tracking System
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
