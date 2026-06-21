import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme, useAuth } from '../context/ThemeContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const API_BASE = 'https://velorix-backend-vg5i.onrender.com';

export default function Dashboard() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [stats, setStats] = useState({ total: 0, up: 0, down: 0, avgResponseTime: 0 });
  const [latestHealth, setLatestHealth] = useState({});
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [addingEndpoint, setAddingEndpoint] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const { darkMode, toggleDarkMode } = useTheme();
  const { token, logout } = useAuth();
  const healthMapRef = useRef({});
  const navigate = useNavigate();

  const getAuthHeader = () => {
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchEndpoints();
  }, [navigate, token]);

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
        logout();
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
      await axios.post(
        `${API_BASE}/api/endpoints`,
        { name: newName, url: newUrl },
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

  const analyzeErrors = async () => {
    setLoadingAi(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/ai/analyze`,
        {},
        getAuthHeader()
      );
      setAiSuggestion(response.data);
      toast.success('Analysis complete!');
    } catch (err) {
      if (err.response?.status === 404) {
        toast.success('No errors found in the last 24 hours 🎉');
        setAiSuggestion(null);
      } else {
        console.error(err);
        toast.error(err.response?.data?.error || 'AI analysis failed');
      }
    } finally {
      setLoadingAi(false);
    }
  };

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
          <p className="text-cyan-300">Loading Dashboard...</p>
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
            className="w-full px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/30 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100"
          >
            <span className="text-xl">📊</span>
            <span className="font-semibold">Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100"
          >
            <span className="text-xl">📈</span>
            <span className="font-semibold">Analytics</span>
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100"
          >
            <span className="text-xl">📋</span>
            <span className="font-semibold">Logs</span>
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

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-cyan-300">Dashboard</h2>
            <p className="text-cyan-400/60 mt-2">Monitor and manage your API endpoints</p>
          </div>

          {/* Top Section: Add Endpoint + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Add Endpoint */}
            <div className="lg:col-span-1 bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6 hover:bg-cyan-500/25 transition-all">
              <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                <span>➕</span> Add New Endpoint
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-cyan-900/40 border border-cyan-400/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-cyan-400/50 transition-all"
                  disabled={addingEndpoint}
                />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addEndpoint()}
                  className="w-full px-4 py-3 bg-cyan-900/40 border border-cyan-400/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-cyan-400/50 transition-all"
                  disabled={addingEndpoint}
                />
                <button
                  onClick={addEndpoint}
                  disabled={addingEndpoint}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-lg font-bold disabled:opacity-50 transition-all shadow-lg"
                >
                  {addingEndpoint ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[
                { label: 'Total APIs', value: stats.total, color: 'from-blue-600 to-blue-500', icon: '📊' },
                { label: 'UP', value: stats.up, color: 'from-green-600 to-green-500', icon: '✅' },
                { label: 'DOWN', value: stats.down, color: 'from-red-600 to-red-500', icon: '❌' },
                { label: 'Avg Response', value: `${stats.avgResponseTime}ms`, color: 'from-orange-600 to-orange-500', icon: '⏱️' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/80 text-sm font-semibold">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <span className="text-4xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section: Endpoints + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Endpoints List */}
            <div className="lg:col-span-1 bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6 hover:bg-cyan-500/25 transition-all max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                <span>📍</span> Monitored Endpoints
              </h3>

              {endpoints.length === 0 ? (
                <p className="text-cyan-400/60 text-center py-8">No endpoints yet</p>
              ) : (
                <div className="space-y-3">
                  {endpoints.map((ep) => (
                    <div
                      key={ep._id || ep.id}
                      className="bg-cyan-900/40 border border-cyan-400/30 rounded-xl p-4 cursor-pointer hover:bg-cyan-900/60 hover:border-cyan-400/50 transition-all group"
                      onClick={() => handleEndpointClick(ep)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-cyan-300 group-hover:text-cyan-100">{ep.name || ep.url}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          (ep.active || ep.status === 'UP')
                            ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                            : 'bg-red-500/30 text-red-300 border border-red-400/30'
                        }`}>
                          {(ep.active || ep.status === 'UP') ? '🟢 UP' : '🔴 DOWN'}
                        </span>
                      </div>
                      <p className="text-cyan-400/60 text-xs break-all">{ep.url}</p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-cyan-400/70">
                          Latest: {latestHealth[ep._id || ep.id] ? `${latestHealth[ep._id || ep.id]}ms` : '—'}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEndpoint(ep._id || ep.id);
                          }}
                          className="px-2 py-1 bg-red-500/30 hover:bg-red-500/50 border border-red-400/30 text-red-300 text-xs rounded transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chart */}
            {selectedEndpoint && (
              <div className="lg:col-span-2 bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6 hover:bg-cyan-500/25 transition-all">
                <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                  <span>📈</span> Response Time Trend
                </h3>
                {loadingChart ? (
                  <p className="text-center py-8 text-cyan-400/60">Loading...</p>
                ) : chartData.length === 0 ? (
                  <p className="text-center py-8 text-cyan-400/60">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#06b6d420" />
                      <XAxis dataKey="checkedAt" stroke="#06b6d4" />
                      <YAxis stroke="#06b6d4" />
                      <Tooltip contentStyle={{ backgroundColor: '#0d4f5f', border: '1px solid #06b6d4', borderRadius: '8px' }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="responseTimeMs"
                        name="Response (ms)"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{ fill: '#06b6d4', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>

          {/* AI Analysis */}
          <div className="mt-8 bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6 hover:bg-cyan-500/25 transition-all">
            <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
              <span>🤖</span> AI Error Analysis
            </h3>
            <button
              onClick={analyzeErrors}
              disabled={loadingAi}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold disabled:opacity-50 transition-all shadow-lg text-white"
            >
              {loadingAi ? 'Analyzing...' : '🔍 Analyze Recent Errors with AI'}
            </button>

            {aiSuggestion && (
              <div className="mt-6 p-6 bg-purple-500/20 border-2 border-purple-400/40 rounded-xl">
                <h4 className="font-bold text-purple-300 mb-4">🤖 AI Diagnosis</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-purple-300/70 text-sm font-semibold">Possible Cause:</p>
                    <p className="text-white mt-2">{aiSuggestion.possibleCause}</p>
                  </div>
                  <div>
                    <p className="text-purple-300/70 text-sm font-semibold">Recommended Fix:</p>
                    <p className="text-white mt-2">{aiSuggestion.recommendedFix}</p>
                  </div>
                  <div>
                    <p className="text-purple-300/70 text-sm font-semibold">Severity:</p>
                    <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold border ${
                      aiSuggestion.severity === 'HIGH' ? 'bg-red-500/30 text-red-300 border-red-400/50' :
                      aiSuggestion.severity === 'MEDIUM' ? 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50' :
                      'bg-green-500/30 text-green-300 border-green-400/50'
                    }`}>
                      {aiSuggestion.severity}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}