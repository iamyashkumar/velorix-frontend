import { useEffect, useState } from 'react';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { FiMoon, FiSun, FiMenu } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import useDarkMode from '../hooks/useDarkMode';

export default function Analytics() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [summary, setSummary] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpointId, setSelectedEndpointId] = useState(null);
  const [endpointAnalytics, setEndpointAnalytics] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAllData();
  }, [days]);

  useEffect(() => {
    if (selectedEndpointId) {
      fetchEndpointAnalytics(selectedEndpointId);
      fetchTrendData(selectedEndpointId);
    }
  }, [selectedEndpointId, days]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await fetchSummary();
      await fetchEndpoints();
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/analytics/summary');
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchEndpoints = async () => {
    try {
      const response = await api.get('/api/endpoints');
      setEndpoints(response.data);
      if (response.data.length > 0 && !selectedEndpointId) {
        setSelectedEndpointId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching endpoints:', err);
    }
  };

  const fetchEndpointAnalytics = async (endpointId) => {
    try {
      const response = await api.get(`/api/analytics/endpoint/${endpointId}?days=${days}`);
      setEndpointAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching endpoint analytics:', err);
    }
  };

  const fetchTrendData = async (endpointId) => {
    try {
      const response = await api.get(`/api/analytics/trend/${endpointId}?days=${days}`);
      setTrendData(response.data.trendData || []);
    } catch (err) {
      console.error('Error fetching trend data:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <FiSun size={22} className="text-yellow-400" /> : <FiMoon size={22} />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📊 Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor endpoint performance and uptime</p>
          </div>

          {/* Days Filter */}
          <div className="mb-6 flex gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  days === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-600'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Endpoints */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Endpoints</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{summary.totalEndpoints}</p>
                  </div>
                  <span className="text-4xl">🌐</span>
                </div>
              </div>

              {/* Uptime */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Uptime</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{summary.uptimePercentage}%</p>
                  </div>
                  <span className="text-4xl">📈</span>
                </div>
              </div>

              {/* Avg Response */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Response</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{summary.averageResponseTime}ms</p>
                  </div>
                  <span className="text-4xl">⚡</span>
                </div>
              </div>

              {/* SLA Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">SLA Status</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{summary.slaStatus}</p>
                  </div>
                  <span className="text-4xl">✨</span>
                </div>
              </div>
            </div>
          )}

          {/* Endpoint Selector */}
          {endpoints.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <label className="text-gray-900 dark:text-white font-semibold mb-3 block">Select Endpoint</label>
              <select
                value={selectedEndpointId || ''}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-gray-900 font-medium"
              >
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.name} - {ep.url}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Endpoint Detailed Analytics */}
          {endpointAnalytics && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📊 {endpointAnalytics.endpointName} - Detailed Analytics
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Uptime</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{endpointAnalytics.uptimePercentage}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Response</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{endpointAnalytics.averageResponseTime}ms</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Checks</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{endpointAnalytics.totalChecks}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Failure Rate</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{endpointAnalytics.failureRate}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Max Response</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">{endpointAnalytics.maxResponseTime}ms</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Min Response</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">{endpointAnalytics.minResponseTime}ms</p>
                </div>
              </div>
            </div>
          )}

          {/* Uptime Trend Chart */}
          {trendData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">📈 Uptime Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    label={{ value: 'Uptime %', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="uptime"
                    name="Uptime %"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Response Time Trend Chart */}
          {trendData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">⚡ Response Time Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="avgResponseTime"
                    name="Avg Response (ms)"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Empty State */}
          {endpoints.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No endpoints added yet. Add an endpoint from the Dashboard to see analytics.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}