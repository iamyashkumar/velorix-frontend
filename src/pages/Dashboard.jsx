import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme, useAuth } from '../context/ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      if (selectedEndpoint && (selectedEndpoint._id === id || selectedEndpoint.id === id)) {
        setSelectedEndpoint(null);
        setChartData([]);
      }
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
            Velorix
          </h1>
          <p className="text-cyan-300/70 text-xs mt-2 tracking-wider">API MONITOR</p>
        </div>

        <nav className="flex-1 space-y-3">
          <button onClick={() => navigate('/dashboard')} className="w-full px-4 py-3 bg-cyan-500/30 border border-cyan-400/40 rounded-xl text-left flex items-center gap-3 text-cyan-100">
            <span className="text-xl">📊</span> <span className="font-semibold">Dashboard</span>
          </button>
          <button onClick={() => navigate('/analytics')} className="w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100">
            <span className="text-xl">📈</span> <span className="font-semibold">Analytics</span>
          </button>
          <button onClick={() => navigate('/logs')} className="w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100">
            <span className="text-xl">📋</span> <span className="font-semibold">Logs</span>
          </button>
        </nav>

        <div className="space-y-3 pt-6 border-t border-cyan-400/20">
          <div className="flex items-center justify-between p-3 bg-cyan-500/10 rounded-xl border border-cyan-400/20">
            <span className="flex items-center gap-2 text-cyan-300">
              <span>{darkMode ? '🌙' : '☀️'}</span> <span className="text-sm font-semibold">Theme</span>
            </span>
            <button onClick={toggleDarkMode} className="relative inline-flex h-6 w-11 items-center rounded-full bg-cyan-600/30 border border-cyan-400/30 transition-all">
              <span className={`inline-block h-4 w-4 transform rounded-full bg-cyan-400 transition-all ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <button onClick={handleLogout} className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-xl transition-all text-left flex items-center gap-3 text-red-300 font-semibold">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 relative overflow-y-auto z-10">
        {/* Top Cards/Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-cyan-500/15 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <p className="text-cyan-400/60 text-sm font-semibold uppercase">Total Endpoints</p>
            <h3 className="text-4xl font-bold mt-2">{stats.total}</h3>
          </div>
          <div className="bg-green-500/15 backdrop-blur-md border border-green-500/30 rounded-2xl p-6">
            <p className="text-green-400/60 text-sm font-semibold uppercase">Endpoints UP</p>
            <h3 className="text-4xl font-bold mt-2 text-green-400">{stats.up}</h3>
          </div>
          <div className="bg-red-500/15 backdrop-blur-md border border-red-500/30 rounded-2xl p-6">
            <p className="text-red-400/60 text-sm font-semibold uppercase">Endpoints DOWN</p>
            <h3 className="text-4xl font-bold mt-2 text-red-400">{stats.down}</h3>
          </div>
          <div className="bg-purple-500/15 backdrop-blur-md border border-purple-400/30 rounded-2xl p-6">
            <p className="text-purple-400/60 text-sm font-semibold uppercase">Avg Latency</p>
            <h3 className="text-4xl font-bold mt-2 text-purple-400">{stats.avgResponseTime}ms</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endpoint Configuration & List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Add New Endpoint</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Endpoint Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-cyan-900/40 border border-cyan-400/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                />
                <input
                  type="url"
                  placeholder="https://api.example.com/health"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-cyan-900/40 border border-cyan-400/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                />
                <button
                  onClick={addEndpoint}
                  disabled={addingEndpoint}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-bold transition-all shadow-lg"
                >
                  {addingEndpoint ? 'Adding...' : 'Add Endpoint'}
                </button>
              </div>
            </div>

            {/* AI diagnosis trigger */}
            <div className="bg-cyan-500/15 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
              <button
                onClick={analyzeErrors}
                disabled={loadingAi}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {loadingAi ? 'Analyzing System...' : '🤖 Smart AI Analysis'}
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

          {/* Endpoints Monitors List & Graph details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-cyan-500/15 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Monitored Endpoints</h3>
              <div className="space-y-3">
                {endpoints.map((ep) => {
                  const id = ep._id || ep.id;
                  const isSelected = selectedEndpoint && (selectedEndpoint._id === id || selectedEndpoint.id === id);
                  return (
                    <div
                      key={id}
                      onClick={() => handleEndpointClick(ep)}
                      className={`p-4 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${
                        isSelected ? 'bg-cyan-500/30 border-cyan-400' : 'bg-cyan-900/20 border-cyan-400/20 hover:bg-cyan-500/10'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-cyan-200">{ep.name}</h4>
                        <p className="text-sm text-cyan-400/60 break-all">{ep.url}</p>
                        <p className="text-xs text-purple-300 font-semibold mt-1">
                          Latency: {latestHealth[id] ? `${latestHealth[id]}ms` : 'Fetching...'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ep.active || ep.status === 'UP' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {ep.active || ep.status === 'UP' ? 'UP' : 'DOWN'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEndpoint(id);
                          }}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Chart details */}
            {selectedEndpoint && (
              <div className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-cyan-300 mb-2">Performance History</h3>
                <p className="text-sm text-cyan-400/60 mb-4">{selectedEndpoint.name} ({selectedEndpoint.url})</p>
                {loadingChart ? (
                  <p className="text-center py-8 text-cyan-300">Loading metrics chart...</p>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" h={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0891b2" opacity={0.2} />
                      <XAxis dataKey="checkedAt" stroke="#22d3ee" />
                      <YAxis stroke="#22d3ee" />
                      <Tooltip contentStyle={{ backgroundColor: '#0e7490', border: 'none', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="responseTimeMs" stroke="#a855f7" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-cyan-400/60">No recent history logs for this endpoint.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}