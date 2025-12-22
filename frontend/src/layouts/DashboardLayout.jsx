import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-[#fdf0d5] dark:bg-slate-900 transition-colors duration-300 flex flex-col">
      {/* SIDEBAR - Fixed Left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN WRAPPER - Pushes content right on Desktop */}
      <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300">
        
        {/* HEADER - Sticky Top */}
        <Header 
            onMobileMenuClick={() => setSidebarOpen(true)} 
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* MOBILE OVERLAY - Closes Sidebar when clicked */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden glass-overlay"
            onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
