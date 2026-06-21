import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme, useAuth } from '../context/ThemeContext';

const API_BASE = 'https://velorix-backend-vg5i.onrender.com';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { darkMode, toggleDarkMode } = useTheme();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const getAuthHeader = () => {
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchLogs();
  }, [navigate, token]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/health/logs?size=100`, getAuthHeader());
      const logsData = Array.isArray(response.data) ? response.data : [];
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    (log.endpointName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.endpointUrl || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading Logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 text-white flex">
      {/* Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Sidebar */}
      <aside className="relative w-64 bg-teal-800/40 backdrop-blur-md border-r border-cyan-400/20 p-6 flex flex-col rounded-tr-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Velorix
          </h1>
          <p className="text-cyan-300/70 text-xs mt-2 tracking-wider">API MONITOR</p>
        </div>

        <nav className="flex-1 space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100"
          >
            <span>📊</span> <span className="font-semibold">Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100"
          >
            <span>📈</span> <span className="font-semibold">Analytics</span>
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="w-full px-4 py-3 bg-cyan-500/30 border border-cyan-400/40 rounded-xl text-left flex items-center gap-3 text-cyan-100"
          >
            <span>📋</span> <span className="font-semibold">Logs</span>
          </button>
        </nav>

        <div className="space-y-3 pt-6 border-t border-cyan-400/20">
          <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-xl border border-cyan-400/20">
            <span className="flex items-center gap-2 text-cyan-300">
              <span>{darkMode ? '🌙' : '☀️'}</span>
              <span className="text-sm font-semibold">Theme</span>
            </span>
            <button
              onClick={toggleDarkMode}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-cyan-600/30 border border-cyan-400/30 transition-all"
            >
              <span className={`inline-block h-4 w-4 transform bg-cyan-300 rounded-full transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-500/30 hover:bg-red-500/50 border border-red-400/30 text-red-200 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-cyan-300 mb-8">Logs</h2>

          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search by endpoint name or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-cyan-900/40 border-2 border-cyan-400/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-cyan-400/50 transition-all"
            />
          </div>

          {/* Logs Table */}
          <div className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6 overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <p className="text-cyan-400/60 text-center py-8">No logs found</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-400/30">
                    <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Endpoint</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-semibold">URL</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Response Time</th>
                    <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, i) => (
                    <tr key={i} className="border-b border-cyan-400/10 hover:bg-cyan-500/10 transition-colors">
                      <td className="py-3 px-4 text-cyan-300">{log.endpointName || 'N/A'}</td>
                      <td className="py-3 px-4 text-cyan-400/70 text-xs break-all">{log.endpointUrl || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.statusCode >= 200 && log.statusCode < 300
                            ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                            : 'bg-red-500/30 text-red-300 border border-red-400/30'
                        }`}>
                          {log.statusCode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyan-300 font-semibold">{log.responseTimeMs || 0}ms</td>
                      <td className="py-3 px-4 text-cyan-400/70 text-xs">{new Date(log.checkedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}