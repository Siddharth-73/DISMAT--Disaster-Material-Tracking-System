"use client";

import LiveDisasterMap from "../components/LiveDisasterMap";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSafetyIndex, setCurrentSafetyIndex] = useState(0);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  
  // News State
  const [newsArticles, setNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(false);

  // Form State
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

  // Slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % disasterSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch News from GNews API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          "https://gnews.io/api/v4/search?q=flood OR earthquake OR cyclone OR landslide&lang=en&country=in&max=10&apikey=f5ae72b413aa9d62cfaad001e0f46279"
        );
        
        if (!res.ok) throw new Error("Failed to fetch news");
        
        const data = await res.json();
        
        if (data.articles) {
          // Limit to 6 articles
          setNewsArticles(data.articles.slice(0, 6));
        } else {
          setNewsError(true);
        }
      } catch (err) {
        console.error("News fetch error:", err);
        setNewsError(true);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  // Submit Emergency Report
  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      
      const res = await fetch("http://localhost:5000/api/public/emergency-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) throw new Error("Failed to submit");
      
      // If success
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
    <div className="min-h-screen font-sans text-slate-100 bg-[#0f172a] relative overflow-hidden">
       {/* Global Background Effects */}
       <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]"></div>
       </div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/5 shadow-2xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-3xl">🚀</span> DISMAT
          </Link>
          <nav className="flex items-center gap-8">
            <a
              href="#safety"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Safety Guidelines
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Emergency
            </a>
            <Link
              to="/statistics"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Statistics
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg text-sm font-bold bg-white text-slate-900 hover:bg-slate-200 transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <div className="pt-24 relative z-10 pb-20">
        {/* HERO */}
        <section className="py-12 text-center relative">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400">
            Disaster Relief <br/> Material Tracking System
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-3xl mx-auto mb-12">
            Transparency • Accountability • Relief to the last person
          </p>

          <div className="max-w-5xl mx-auto px-4">
             <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                {disasterSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`transition-opacity duration-1000 ${index === currentSlide ? "block opacity-100" : "hidden opacity-0"}`}
                  >
                    <img
                      src={slide.image || "/placeholder.svg"}
                      alt={slide.title}
                      className="w-full h-[500px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-10 md:p-16 text-left">
                       <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="text-6xl mb-4 animate-bounce-slow">{slide.icon}</div>
                          <h3 className="text-4xl font-bold text-white mb-2">{slide.title}</h3>
                          <p className="text-lg text-slate-300">{slide.description}</p>
                       </div>
                    </div>
                  </div>
                ))}
                
                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                    {disasterSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-8" : "bg-white/40 hover:bg-white/60"}`}
                        />
                    ))}
                </div>
             </div>
          </div>
        </section>

        {/* Live Disaster Map */}
        <section className="py-20 px-4">
           <GlassCard className="max-w-6xl mx-auto p-8 md:p-12 relative overflow-hidden" delay={0.1}>
              <div className="text-center mb-10">
                 <h2 className="text-4xl font-bold text-white mb-4">Live Disaster Map</h2>
                 <p className="text-slate-400">Real-time overview of active disaster zones across the country</p>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl h-[600px] relative z-10">
                 <LiveDisasterMap />
              </div>
              
               {/* Decorative Lights */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
           </GlassCard>
        </section>

        {/* Disaster Safety Guidelines */}
        <section id="safety" className="py-20 px-4 max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Disaster Safety Guidelines</h2>

          <div className="relative">
            <GlassCard className="p-8 md:p-12 min-h-[600px] transition-all duration-500" delay={0.2}>
              {!selectedDisaster ? (
                // Carousel View
                <div className="flex flex-col items-center text-center">
                   <div className="w-full max-w-3xl mb-8 relative group cursor-pointer" onClick={() => setSelectedDisaster(comprehensiveSafetyTips[currentSafetyIndex])}>
                      <img 
                        src={comprehensiveSafetyTips[currentSafetyIndex].image || "/placeholder.svg"} 
                        alt={comprehensiveSafetyTips[currentSafetyIndex].type}
                        className="w-full h-[400px] object-cover rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-bold border border-white/30">Read Guidelines</span>
                      </div>
                   </div>

                   <div className="text-6xl mb-4">{comprehensiveSafetyTips[currentSafetyIndex].icon}</div>
                   <h3 className="text-3xl font-bold text-white mb-6">{comprehensiveSafetyTips[currentSafetyIndex].type}</h3>
                   
                   <button
                     onClick={() => setSelectedDisaster(comprehensiveSafetyTips[currentSafetyIndex])}
                     className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/30"
                   >
                     View Safety Guidelines
                   </button>
                </div>
              ) : (
                // Detailed View
                <div className="animate-fadeIn">
                   <button 
                     onClick={() => setSelectedDisaster(null)}
                     className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium px-4 py-2 hover:bg-white/5 rounded-lg"
                   >
                      <span>←</span> Back to Carousel
                   </button>

                   <div className="text-center mb-10">
                      <div className="text-5xl mb-2">{selectedDisaster.icon}</div>
                      <h3 className="text-3xl font-bold text-white">{selectedDisaster.type}</h3>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Before */}
                      <div className="bg-blue-900/10 border border-blue-500/30 p-6 rounded-xl hover:bg-blue-900/20 transition-colors">
                         <h4 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                            <span>✅</span> Before (Preparedness)
                         </h4>
                         <ul className="space-y-3">
                            {selectedDisaster.before.map((tip, i) => (
                              <li key={i} className="text-slate-300 text-sm flex gap-2">
                                <span className="text-blue-500">•</span> {tip}
                              </li>
                            ))}
                         </ul>
                      </div>

                      {/* During */}
                      <div className="bg-amber-900/10 border border-amber-500/30 p-6 rounded-xl hover:bg-amber-900/20 transition-colors">
                         <h4 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                            <span>⚠️</span> During (Action)
                         </h4>
                         <ul className="space-y-3">
                            {selectedDisaster.during.map((tip, i) => (
                              <li key={i} className="text-slate-300 text-sm flex gap-2">
                                <span className="text-amber-500">•</span> {tip}
                              </li>
                            ))}
                         </ul>
                      </div>

                      {/* After */}
                      <div className="bg-emerald-900/10 border border-emerald-500/30 p-6 rounded-xl hover:bg-emerald-900/20 transition-colors">
                         <h4 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                            <span>🔁</span> After (Recovery)
                         </h4>
                         <ul className="space-y-3">
                            {selectedDisaster.after.map((tip, i) => (
                              <li key={i} className="text-slate-300 text-sm flex gap-2">
                                <span className="text-emerald-500">•</span> {tip}
                              </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>
              )}
            </GlassCard>

            {/* Navigation Arrows */}
            {!selectedDisaster && (
               <>
                 <button 
                   onClick={prevSafetyTip}
                   className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-blue-600 transition-colors border border-white/10 hover:scale-110 z-20"
                 >
                    ‹
                 </button>
                 <button 
                   onClick={nextSafetyTip}
                   className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-blue-600 transition-colors border border-white/10 hover:scale-110 z-20"
                 >
                    ›
                 </button>
               </>
            )}
          </div>
          
           {/* Dots */}
          {!selectedDisaster && (
            <div className="flex justify-center gap-3 mt-8">
               {comprehensiveSafetyTips.map((_, index) => (
                 <button
                   key={index}
                   onClick={() => setCurrentSafetyIndex(index)}
                   className={`w-3 h-3 rounded-full border border-blue-500 transition-all ${index === currentSafetyIndex ? "bg-blue-500 scale-125" : "bg-transparent hover:bg-blue-500/50"}`}
                 />
               ))}
            </div>
          )}
        </section>

        {/* Recent Disaster News */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Recent Disaster News</h2>

          {loadingNews ? (
             <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Fetching latest updates...</p>
             </div>
          ) : newsError ? (
             <p className="text-center text-red-400">Unable to load disaster news at the moment</p>
          ) : newsArticles.length === 0 ? (
             <p className="text-center text-slate-500">No recent news available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {newsArticles.map((article, i) => (
                 <a
                   key={i}
                   href={article.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="group block bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all hover:-translate-y-2 hover:shadow-2xl"
                 >
                    <div className="h-48 overflow-hidden relative">
                       <img 
                         src={article.image || "/placeholder.svg"} 
                         alt={article.title}
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    </div>
                    <div className="p-6">
                       <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                          <span className="px-2 py-1 bg-white/5 rounded uppercase tracking-wider">{article.source.name}</span>
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                       </div>
                       <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {article.title}
                       </h3>
                       <span className="text-sm font-bold text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                          Read Full Article →
                       </span>
                    </div>
                 </a>
               ))}
            </div>
          )}
        </section>

        {/* Emergency Form */}
        <section id="contact" className="py-20 px-4">
           <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                 <h2 className="text-4xl font-bold text-white mb-4">Emergency Contact Form</h2>
                 <p className="text-slate-400">Report an emergency and our team will respond immediately</p>
              </div>

              <GlassCard className="p-8 md:p-12 relative overflow-hidden">
                 {/* Flash warning stripe */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

                 <form onSubmit={submitReport} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full px-5 py-4 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                          />
                       </div>
                       <div>
                          <input
                            type="text"
                            placeholder="Contact Number"
                            value={form.contact}
                            onChange={(e) => setForm({ ...form, contact: e.target.value })}
                            required
                            className="w-full px-5 py-4 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                          />
                       </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                      className="w-full px-5 py-4 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                    />

                    <textarea
                      placeholder="Describe the emergency..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-5 py-4 rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-lg font-bold text-white text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-[1.01] disabled:opacity-50"
                    >
                       {submitting ? "Transmitting..." : "🚨 Transmit Emergency Report"}
                    </button>

                    {message && (
                       <div className={`p-4 rounded-lg text-center font-bold ${message.includes("success") ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                          {message}
                       </div>
                    )}
                 </form>
              </GlassCard>
           </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/20 backdrop-blur-lg py-8 text-center">
            <p className="text-slate-500 text-sm">
               ©️ 2025 DISMAT — Disaster Relief Material Tracking System
            </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
