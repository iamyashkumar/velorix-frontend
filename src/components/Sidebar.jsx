import { FiX, FiActivity, FiList, FiMoon, FiSun, FiLogOut, FiBarChart2 } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const closeOnMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#111c24] border-r border-[#1e2d38] flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:sticky md:h-screen`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#1e2d38]">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🚀</div>
          <h2 className="text-xl font-bold text-white tracking-wide">Velorix</h2>

          {/* Theme Toggle Button Matched precisely with image_be1f0d.png */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 transition-colors ml-1"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} className="text-gray-400" />}
          </button>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white hover:text-gray-300"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

        {/* Dashboard */}
        <button
          onClick={() => {
            navigate('/dashboard');
            closeOnMobile();
          }}
          className={`flex items-center w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isActive('/dashboard')
              ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-600/10'
              : 'text-gray-400 hover:bg-[#162530] hover:text-gray-200'
          }`}
        >
          <FiActivity className="mr-3 text-current" size={20} />
          <span>Dashboard</span>
        </button>

        {/* Analytics */}
        <button
          onClick={() => {
            navigate('/analytics');
            closeOnMobile();
          }}
          className={`flex items-center w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isActive('/analytics')
              ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-600/10'
              : 'text-gray-400 hover:bg-[#162530] hover:text-gray-200'
          }`}
        >
          <FiBarChart2 className="mr-3 text-current" size={20} />
          <span>Analytics</span>
        </button>

        {/* Log Viewer */}
        <button
          onClick={() => {
            navigate('/logs');
            closeOnMobile();
          }}
          className={`flex items-center w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            isActive('/logs')
              ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-600/10'
              : 'text-gray-400 hover:bg-[#162530] hover:text-gray-200'
          }`}
        >
          <FiList className="mr-3 text-current" size={20} />
          <span>Log Viewer</span>
        </button>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#1e2d38] bg-[#111c24] mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-xl font-semibold text-sm text-rose-400/90 hover:text-rose-400 hover:bg-rose-500/5 transition-colors duration-200"
        >
          <FiLogOut className="mr-3 rotate-180" size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}