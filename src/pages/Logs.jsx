import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    fetchLogs();
  }, [level, page]);

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

  const levelColor = (lvl) => {
    if (lvl === 'ERROR') return 'text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300';
    if (lvl === 'WARN')  return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
    return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md md:hidden"
      >
        <FiMenu size={24} className="text-gray-800 dark:text-white" />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Velorix</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <FiX size={24} className="text-gray-800 dark:text-white" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="block w-full text-left text-blue-600 dark:text-blue-400 font-semibold"
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
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button onClick={handleLogout} className="w-full text-left text-red-600 dark:text-red-400">Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Log Viewer</h2>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={level}
            onChange={(e) => { setLevel(e.target.value); setPage(0); }}
            className="p-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            className="p-2 border rounded flex-1 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
          <button
            onClick={() => { setPage(0); fetchLogs(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {/* Log list */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded shadow animate-pulse h-16" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-lg font-medium">No logs found</p>
            <p className="text-sm mt-1">Try sending logs via POST /api/logs or change your filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow hover:shadow-md transition">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${levelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-800 dark:text-gray-200 text-sm">{log.message}</p>
                {log.source && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Source: {log.source}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded disabled:opacity-40 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400 text-sm">Page {page + 1} of {totalPages}</span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded disabled:opacity-40 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
