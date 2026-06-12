import { FiX, FiActivity, FiList, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const closeOnMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:sticky md:h-screen`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Velorix</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden md:block p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? <FiSun size={18} className="text-yellow-400" /> : <FiMoon size={18} />}
          </button>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-gray-800 dark:text-white"
        >
          <FiX size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => {
            navigate('/dashboard');
            closeOnMobile();
          }}
          className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <FiActivity className="mr-3" size={20} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => {
            navigate('/logs');
            closeOnMobile();
          }}
          className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <FiList className="mr-3" size={20} />
          <span>Log Viewer</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <FiLogOut className="mr-3" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}