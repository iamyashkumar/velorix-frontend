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
    } catch (error) {
      console.error('Failed to fetch endpoints', error);
      toast.error('Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (endpointsList) => {
    const total = endpointsList.length;
    const up = endpointsList.filter(ep => ep.active).length;
    const down = total - up;
    // For avg response time, we'd need to fetch latest health logs – simplified for now
    setStats({ total, up, down, avgResponseTime: 0 });
    // Optionally fetch average from backend (can be enhanced)
    if (total > 0) {
      // You could call an API to get average response time for all endpoints
      // For now, set to 0 or compute from first endpoint's latest log
    }
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
      // Update avg response time for this endpoint
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
      toast.success('AI analysis complete');
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

      {/* Sidebar – removed Refresh and Analyze Errors */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Velorix</h2>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <FiX size={24} className="text-gray-800 dark:text-white" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <button onClick={() => { setSelectedEndpoint(null); setChartData([]); setAiSuggestion(null); }} className="block w-full text-left text-gray-700 dark:text-gray-300">Dashboard</button>
          <button onClick={() => navigate('/logs')} className="block w-full text-left text-gray-700 dark:text-gray-300">Log Viewer</button>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button onClick={() => setDarkMode(!darkMode)} className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" style={{ backgroundColor: darkMode ? '#3b82f6' : '#9ca3af' }}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </nav>
        <div className="p-4 border-t mt-auto">
          <button onClick={handleLogout} className="w-full text-left text-red-600 dark:text-red-400">Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64">
        <div className="px-6 pt-4 pb-6">
          {/* Add Endpoint Form at the top */}
          <div className="mb-6">
            <AddEndpointForm onEndpointAdded={() => setRefreshKey(prev => prev + 1)} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total APIs</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
              <p className="text-green-600 dark:text-green-400 text-sm">UP</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.up}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
              <p className="text-red-600 dark:text-red-400 text-sm">DOWN</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.down}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Avg Response (ms)</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.avgResponseTime}</p>
            </div>
          </div>

          {/* Endpoint Cards Section */}
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Monitored Endpoints</h2>
          {endpoints.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No endpoints added yet. Use the form above to add one.</p>
          ) : (
            <div className="grid gap-4">
              {endpoints.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => handleEndpointClick(ep)}
                  className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center cursor-pointer hover:shadow-md transition"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{ep.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ep.url}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${ep.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {ep.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Response Time Chart (shown when an endpoint is clicked) */}
          {selectedEndpoint && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Response Time Trend – {selectedEndpoint.name}</h3>
              {loadingChart ? <p>Loading chart...</p> : chartData.length === 0 ? <p>No health logs yet.</p> : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="checkedAt" />
                      <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="responseTimeMs" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* AI Analysis Button */}
          <div className="mt-8">
            <button onClick={analyzeErrors} disabled={loadingAi} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50">
              {loadingAi ? 'Analyzing...' : '🔍 Analyze Recent Errors with AI'}
            </button>
            {aiSuggestion && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded shadow">
                <h3 className="font-bold text-lg">🤖 AI Diagnosis</h3>
                <p><strong>Possible Cause:</strong> {aiSuggestion.possibleCause}</p>
                <p><strong>Recommended Fix:</strong> {aiSuggestion.recommendedFix}</p>
                <p><strong>Severity:</strong> <span className={`ml-2 px-2 py-1 rounded text-sm ${aiSuggestion.severity === 'HIGH' ? 'bg-red-100 text-red-800' : aiSuggestion.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{aiSuggestion.severity}</span></p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}