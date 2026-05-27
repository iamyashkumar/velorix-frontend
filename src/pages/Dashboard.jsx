import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiActivity, FiList, FiMoon, FiSun, FiLogOut, FiTrendingUp } from 'react-icons/fi';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:flex">

      {/* Mobile Top Navbar */}
      <div className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 md:hidden sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - flex-col h-full apply kiya hai for mobile view bottom layout */}
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
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-800 dark:text-white">
            <FiX size={24} />
          </button>
        </div>

        {/* Nav Links Container */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => { setSelectedEndpoint(null); setChartData([]); setAiSuggestion(null); if(window.innerWidth < 768) setSidebarOpen(false); }}
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor your APIs and debug errors with AI.</p>
          </div>

          {/* Add Endpoint Form */}
          <div className="mb-8">
            <AddEndpointForm onEndpointAdded={() => setRefreshKey(prev => prev + 1)} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiActivity className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total APIs</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FiTrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">UP</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.up}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <FiTrendingUp className="h-6 w-6 text-red-600 dark:text-red-300 transform rotate-180" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">DOWN</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.down}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FiTrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.avgResponseTime} ms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Endpoints Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monitored Endpoints</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {endpoints.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No endpoints added yet. Use the form above to add one.
                </div>
              ) : (
                endpoints.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => handleEndpointClick(ep)}
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{ep.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ep.url}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Latest: {latestHealth[ep.id] ? `${latestHealth[ep.id]}ms` : '—'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ep.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {ep.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Response Time Chart */}
          {selectedEndpoint && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Response Time Trend – {selectedEndpoint.name}
              </h3>
              {loadingChart ? (
                <div className="text-center py-8 text-gray-500">Loading chart...</div>
              ) : chartData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No health logs yet. Wait for the first check.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="checkedAt" stroke="#9ca3af" />
                    <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="responseTimeMs" name="Response Time (ms)" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* AI Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <button
              onClick={analyzeErrors}
              disabled={loadingAi}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {loadingAi ? 'Analyzing...' : '🔍 Analyze Recent Errors with AI'}
            </button>
            {aiSuggestion && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">🤖 AI Diagnosis</h3>
                <p className="text-gray-700 dark:text-gray-300"><strong>Possible Cause:</strong> {aiSuggestion.possibleCause}</p>
                <p className="mt-2 text-gray-700 dark:text-gray-300"><strong>Recommended Fix:</strong> {aiSuggestion.recommendedFix}</p>
                <p className="mt-2"><strong>Severity:</strong> <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  aiSuggestion.severity === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  aiSuggestion.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>{aiSuggestion.severity}</span></p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}