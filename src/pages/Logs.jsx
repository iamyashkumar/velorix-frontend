import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hamburger button - only visible on mobile (<768px) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md md:hidden"
        aria-label="Menu"
      >
        <FiMenu size={24} className="text-gray-800 dark:text-white" />
      </button>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - same as dashboard */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static`}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Velorix</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-800 dark:text-white"
          >
            <FiX size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 transition"
          >
            Log Viewer
          </button>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: darkMode ? '#3b82f6' : '#9ca3af' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-600 dark:text-red-400 hover:text-red-800 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64">
        <div className="pl-12 md:pl-6 px-6 pt-4 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Filter Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Log Viewer</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <select
                  value={level}
                  onChange={(e) => { setLevel(e.target.value); setPage(0); }}
                  className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">All Levels</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
                <input
                  type="text"
                  placeholder="Search by message"
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
                  className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <button
                  onClick={fetchLogs}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Logs List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              {logs.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No logs found.</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.level === 'ERROR'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : log.level === 'WARN'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-800 dark:text-white">{log.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Source: {log.source || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex justify-between items-center">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}