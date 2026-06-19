import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_BASE = 'https://velorix-backend-vg5i.onrender.com';

export default function Dashboard() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [stats, setStats] = useState({ total: 0, up: 0, down: 0, avgResponseTime: 0 });
  const [latestHealth, setLatestHealth] = useState({});
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [addingEndpoint, setAddingEndpoint] = useState(false);
  const healthMapRef = useRef({});
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchEndpoints();
  }, [navigate]);

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/endpoints`, getAuthHeader());
      const endpointsList = Array.isArray(response.data) ? response.data : [];
      setEndpoints(endpointsList);
      calculateStats(endpointsList);
      endpointsList.forEach(ep => fetchLatestHealth(ep._id || ep.id));
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      toast.error('Failed to load endpoints');
      setEndpoints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestHealth = async (endpointId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/health/logs/${endpointId}?size=1`,
        getAuthHeader()
      );
      if (response.data && response.data.length > 0) {
        const last = response.data[0];
        const responseTime = last.responseTimeMs || 0;
        setLatestHealth(prev => ({ ...prev, [endpointId]: responseTime }));
        healthMapRef.current[endpointId] = responseTime;
        const allTimes = Object.values(healthMapRef.current);
        const avg = allTimes.length > 0
          ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
          : 0;
        setStats(prev => ({ ...prev, avgResponseTime: avg }));
      }
    } catch (err) {
      console.error('Error fetching health:', err);
    }
  };

  const calculateStats = (endpointsList) => {
    const total = endpointsList.length;
    const up = endpointsList.filter(ep => ep.active || ep.status === 'UP').length;
    const down = total - up;
    healthMapRef.current = {};
    setStats({ total, up, down, avgResponseTime: 0 });
  };

  const fetchHealthLogs = async (endpointId) => {
    setLoadingChart(true);
    try {
      const response = await axios.get(
        `${API_BASE}/api/health/logs/${endpointId}?size=50`,
        getAuthHeader()
      );
      const logs = Array.isArray(response.data)
        ? response.data.map((log) => ({
            checkedAt: new Date(log.checkedAt).toLocaleTimeString(),
            responseTimeMs: log.responseTimeMs || 0,
          })).reverse()
        : [];
      setChartData(logs);
      if (logs.length > 0) {
        const avg = logs.reduce((sum, l) => sum + l.responseTimeMs, 0) / logs.length;
        setStats(prev => ({ ...prev, avgResponseTime: Math.round(avg) }));
      }
    } catch (err) {
      console.error('Error loading health logs:', err);
      toast.error('Failed to load health logs');
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleEndpointClick = (endpoint) => {
    setSelectedEndpoint(endpoint);
    const endpointId = endpoint._id || endpoint.id;
    fetchHealthLogs(endpointId);
  };

  const addEndpoint = async () => {
    if (!newName.trim() || !newUrl.trim()) {
      toast.error('Please enter both name and URL');
      return;
    }

    setAddingEndpoint(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/endpoints`,
        {
          name: newName,
          url: newUrl
        },
        getAuthHeader()
      );
      toast.success('Endpoint added!');
      setNewName('');
      setNewUrl('');
      fetchEndpoints();
    } catch (error) {
      console.error('Error adding endpoint:', error);
      toast.error(error.response?.data?.message || 'Failed to add endpoint');
    } finally {
      setAddingEndpoint(false);
    }
  };

  const deleteEndpoint = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/endpoints/${id}`, getAuthHeader());
      toast.success('Endpoint deleted!');
      setEndpoints(endpoints.filter(e => (e._id || e.id) !== id));
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast.error('Failed to delete endpoint');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    toast.success('Logged out');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Sidebar */}
      <aside className="relative w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Velorix
          </h1>
          <p className="text-gray-400 text-sm mt-1">API Monitor</p>
        </div>

        <nav className="flex-1 space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 text-left flex items-center gap-3"
          >
            <span>📊</span>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 text-left flex items-center gap-3"
          >
            <span>📈</span>
            <span>Analytics</span>
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 text-left flex items-center gap-3"
          >
            <span>📋</span>
            <span>Logs</span>
          </button>
        </nav>

        <div className="space-y-3 pt-6 border-t border-white/10">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all duration-300 flex items-center gap-3"
          >
            <span>{darkMode ? '☀️' : '🌙'}</span>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 backdrop-blur-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all duration-300 flex items-center gap-3"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-400">Dashboard</h2>
            <p className="text-gray-400 mt-1">Monitor and manage your API endpoints</p>
          </div>

          {/* Add Endpoint */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 hover:bg-white/10 transition-all duration-300">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">➕ Add New Endpoint</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Endpoint Name (e.g., Google API)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white/20 text-white placeholder-gray-500 transition-all duration-300"
                disabled={addingEndpoint}
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEndpoint()}
                className="px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white/20 text-white placeholder-gray-500 transition-all duration-300"
                disabled={addingEndpoint}
              />
              <button
                onClick={addEndpoint}
                disabled={addingEndpoint}
                className="px-8 py-3 backdrop-blur-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-semibold disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
              >
                {addingEndpoint ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total APIs', value: stats.total, icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
              { label: 'UP', value: stats.up, icon: '✅', gradient: 'from-green-500 to-emerald-500' },
              { label: 'DOWN', value: stats.down, icon: '❌', gradient: 'from-red-500 to-pink-500' },
              { label: 'Avg Response', value: `${stats.avgResponseTime}ms`, icon: '⚡', gradient: 'from-purple-500 to-pink-500' }
            ].map((stat, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:border-white/30 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    <p className={`text-4xl font-bold mt-3 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Endpoints List */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 hover:bg-white/10 transition-all duration-300">
            <h3 className="text-2xl font-bold mb-6 text-cyan-400">📍 Monitored Endpoints ({endpoints.length})</h3>

            {endpoints.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No endpoints yet. Add one above!</p>
            ) : (
              <div className="space-y-3">
                {endpoints.map((ep) => (
                  <div
                    key={ep._id || ep.id}
                    className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-5 cursor-pointer hover:bg-white/15 hover:border-white/20 transition-all duration-300 group"
                    onClick={() => handleEndpointClick(ep)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-lg group-hover:text-cyan-400 transition-colors">{ep.name || ep.url}</p>
                        <p className="text-gray-400 text-sm mt-1">{ep.url}</p>
                        <p className={`text-xs mt-2 font-semibold ${(ep.active || ep.status === 'UP') ? 'text-green-400' : 'text-red-400'}`}>
                          Latest: {latestHealth[ep._id || ep.id] ? `${latestHealth[ep._id || ep.id]}ms` : '—'}
                        </p>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className={`px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-lg ${
                          (ep.active || ep.status === 'UP')
                            ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                            : 'bg-red-500/20 border border-red-500/30 text-red-300'
                        }`}>
                          {(ep.active || ep.status === 'UP') ? '🟢 UP' : '🔴 DOWN'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEndpoint(ep._id || ep.id);
                          }}
                          className="px-3 py-2 backdrop-blur-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs rounded-lg transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart */}
          {selectedEndpoint && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-6 text-cyan-400">
                📈 Response Time Trend – {selectedEndpoint.name || selectedEndpoint.url}
              </h3>
              {loadingChart ? (
                <p className="text-center py-8 text-gray-400">Loading...</p>
              ) : chartData.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="checkedAt" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #ffffff20', borderRadius: '8px' }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responseTimeMs"
                      name="Response (ms)"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}