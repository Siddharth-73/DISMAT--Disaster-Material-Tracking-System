import { useState } from "react"
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#fdf0d5] flex flex-col">
      {/* SIDEBAR - Fixed Left */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN WRAPPER - Pushes content right on Desktop */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        
        {/* HEADER - Sticky Top */}
        <Header onMobileMenuClick={() => setSidebarOpen(true)} />

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* MOBILE OVERLAY - Closes Sidebar when clicked */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden glass-overlay"
            onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
