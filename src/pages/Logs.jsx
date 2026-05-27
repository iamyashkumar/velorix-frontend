import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiActivity, FiList, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [level, setLevel] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchLogs();
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [level, keyword, page]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (level) params.level = level;
      if (keyword) params.keyword = keyword;
      const response = await api.get('/api/logs', { params });
      setLogs(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out');
    navigate('/login');
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:flex">

      {/* Mobile Top Navbar */}
      <div className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 md:hidden sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            aria-label="Menu"
          >
            <FiMenu size={24} className="text-gray-800 dark:text-white" />
          </button>
          <span className="text-lg font-bold text-gray-800 dark:text-white">Velorix</span>
        </div>
        {/* Mobile Dark Mode Toggle Button Icon Only */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <FiSun size={22} className="text-yellow-400" /> : <FiMoon size={22} />}
        </button>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:sticky md:h-screen`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Velorix</h2>
            {/* Desktop Mode Main Header Icon Toggle */}
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

        {/* Nav Links Container */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => { navigate('/dashboard'); if(window.innerWidth < 768) setSidebarOpen(false); }}
            className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FiActivity className="mr-3" size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => { navigate('/logs'); if(window.innerWidth < 768) setSidebarOpen(false); }}
            className="flex items-center w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FiList className="mr-3" size={20} />
            <span>Log Viewer</span>
          </button>
        </nav>

        {/* Bottom Fixed Logout Container */}
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

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* Header text */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log Viewer</h1>
            <p className="text-gray-600 dark:text-gray-400">Track and filter system health logs in real-time.</p>
          </div>

          {/* Filter Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value); setPage(0); }}
                className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
              </select>
              <input
                type="text"
                placeholder="Search by message..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
                className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchLogs}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Logs List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8 p-6">
            {logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No logs found.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50"
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          log.level === 'ERROR'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : log.level === 'WARN'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-800 dark:text-gray-200 font-mono text-sm">{log.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Source: {log.source || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}