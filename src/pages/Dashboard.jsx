import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import AddEndpointForm from '../components/AddEndpointForm';

export default function Dashboard() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, up: 0, down: 0, avgResponseTime: 0 });
  const [latestHealth, setLatestHealth] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchEndpoints();
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [refreshKey]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const fetchEndpoints = async () => {
    try {
      const response = await api.get('/api/endpoints');
      setEndpoints(response.data);
      calculateStats(response.data);
      response.data.forEach(ep => fetchLatestHealth(ep.id));
    } catch (error) {
      console.error('Failed to fetch endpoints', error);
      toast.error('Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestHealth = async (endpointId) => {
    try {
      const res = await api.get(`/api/health/logs/${endpointId}?size=1`);
      if (res.data && res.data.length > 0) {
        const last = res.data[0];
        setLatestHealth(prev => ({ ...prev, [endpointId]: last.responseTimeMs }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateStats = (endpointsList) => {
    const total = endpointsList.length;
    const up = endpointsList.filter(ep => ep.active).length;
    const down = total - up;
    setStats({ total, up, down, avgResponseTime: 0 });
  };

  const fetchHealthLogs = async (endpointId) => {
    setLoadingChart(true);
    try {
      const response = await api.get(`/api/health/logs/${endpointId}?size=50`);
      const logs = response.data.map((log) => ({
        checkedAt: new Date(log.checkedAt).toLocaleTimeString(),
        responseTimeMs: log.responseTimeMs,
      })).reverse();
      setChartData(logs);
      if (logs.length > 0) {
        const avg = logs.reduce((sum, l) => sum + l.responseTimeMs, 0) / logs.length;
        setStats(prev => ({ ...prev, avgResponseTime: Math.round(avg) }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load health logs');
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  const handleEndpointClick = (endpoint) => {
    setSelectedEndpoint(endpoint);
    fetchHealthLogs(endpoint.id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out');
    navigate('/login');
  };

  const analyzeErrors = async () => {
    setLoadingAi(true);
    try {
      const response = await api.post('/api/ai/analyze', {});
      setAiSuggestion(response.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'AI analysis failed');
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

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
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Velorix</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <FiX size={24} className="text-gray-800 dark:text-white" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <button onClick={() => { setSelectedEndpoint(null); setChartData([]); setAiSuggestion(null); }} className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
            Dashboard
          </button>
          <button onClick={() => navigate('/logs')} className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 transition">
            Log Viewer
          </button>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button onClick={() => setDarkMode(!darkMode)} className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" style={{ backgroundColor: darkMode ? '#3b82f6' : '#9ca3af' }}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </nav>
        <div className="p-4 border-t dark:border-gray-700 mt-auto">
          <button onClick={handleLogout} className="w-full text-left text-red-600 dark:text-red-400 hover:text-red-800 transition">
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64">
        <div className="pl-12 md:pl-6 px-6 pt-4 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Add Endpoint Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <AddEndpointForm onEndpointAdded={() => setRefreshKey(prev => prev + 1)} />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">Total APIs</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.total}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-center">
                <p className="text-green-600 dark:text-green-400 text-sm uppercase tracking-wide">UP</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.up}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-center">
                <p className="text-red-600 dark:text-red-400 text-sm uppercase tracking-wide">DOWN</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.down}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wide">Avg Response (ms)</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.avgResponseTime}</p>
              </div>
            </div>

            {/* Endpoint Cards Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Monitored Endpoints</h2>
              {endpoints.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No endpoints added yet. Use the form above to add one.</p>
              ) : (
                <div className="space-y-3">
                  {endpoints.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => handleEndpointClick(ep)}
                      className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{ep.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{ep.url}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Latest: {latestHealth[ep.id] ? `${latestHealth[ep.id]}ms` : '—'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${ep.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {ep.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Response Time Chart */}
            {selectedEndpoint && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Response Time Trend – {selectedEndpoint.name}
                </h3>
                {loadingChart ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading chart...</p>
                ) : chartData.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No health logs yet. Wait for the first check.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="checkedAt" />
                      <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="responseTimeMs" name="Response Time (ms)" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* AI Analysis Button & Result */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <button
                onClick={analyzeErrors}
                disabled={loadingAi}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {loadingAi ? 'Analyzing...' : '🔍 Analyze Recent Errors with AI'}
              </button>
              {aiSuggestion && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">🤖 AI Diagnosis</h3>
                  <p className="text-gray-700 dark:text-gray-300"><strong>Possible Cause:</strong> {aiSuggestion.possibleCause}</p>
                  <p className="mt-2 text-gray-700 dark:text-gray-300"><strong>Recommended Fix:</strong> {aiSuggestion.recommendedFix}</p>
                  <p className="mt-2"><strong>Severity:</strong> <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${aiSuggestion.severity === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : aiSuggestion.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>{aiSuggestion.severity}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}