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
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 md:flex transition-colors duration-300">

      {/* Mobile Top Navbar - Dashboard Theme Matching */}
      <div className="w-full flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 md:hidden sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition text-slate-700 dark:text-slate-300"
          >
            <FiMenu size={24} />
          </button>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Velorix</span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
        >
          {darkMode ? <FiSun size={22} className="text-amber-400" /> : <FiMoon size={22} />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">📊 Analytics Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Monitor endpoint performance, trends, and uptime</p>
          </div>

          {/* Days Filter - Upgraded Style */}
          <div className="mb-6 flex gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  days === d
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10'
                    : 'bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>

          {/* Summary Stats - Premium Neon Color Palette */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Endpoints */}
              <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Endpoints</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">{summary.totalEndpoints}</p>
                  </div>
                  <span className="text-2xl p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">🌐</span>
                </div>
              </div>

              {/* Uptime - Emerald Green Accent */}
              <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Uptime</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">{summary.uptimePercentage}%</p>
                  </div>
                  <span className="text-2xl p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">📈</span>
                </div>
              </div>

              {/* Avg Response - Indigo Accent */}
              <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Response</p>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2 tracking-tight">{summary.averageResponseTime}ms</p>
                  </div>
                  <span className="text-2xl p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">⚡</span>
                </div>
              </div>

              {/* SLA Status - Amber/Orange Accent */}
              <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">SLA Status</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2 tracking-tight">{summary.slaStatus}</p>
                  </div>
                  <span className="text-2xl p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">✨</span>
                </div>
              </div>
            </div>
          )}

          {/* Endpoint Selector - Glass Dropdown */}
          {endpoints.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 mb-8 shadow-sm">
              <label className="text-slate-900 dark:text-white font-semibold text-sm mb-3 block">Select Endpoint</label>
              <select
                value={selectedEndpointId || ''}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-950/50 backdrop-blur-md dark:text-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
              >
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                    {ep.name} — {ep.url}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Endpoint Detailed Analytics */}
          {endpointAnalytics && (
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                📊 {endpointAnalytics.endpointName} — Detailed Analytics
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50/50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Uptime</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{endpointAnalytics.uptimePercentage}%</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Avg Response</p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{endpointAnalytics.averageResponseTime}ms</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Checks</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{endpointAnalytics.totalChecks}</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Failure Rate</p>
                  <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{endpointAnalytics.failureRate}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50/50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Max Response Time</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{endpointAnalytics.maxResponseTime}ms</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Min Response Time</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{endpointAnalytics.minResponseTime}ms</p>
                </div>
              </div>
            </div>
          )}

          {/* Uptime Trend Chart */}
          {trendData.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 mb-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">📈 Uptime Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    label={{ value: 'Uptime %', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '13px' } }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: darkMode ? '#fff' : '#000', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="uptime"
                    name="Uptime %"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Response Time Trend Chart */}
          {trendData.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">⚡ Response Time Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: '13px' } }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: darkMode ? '#fff' : '#000', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="avgResponseTime"
                    name="Avg Response (ms)"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Empty State */}
          {endpoints.length === 0 && (
            <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-12 text-center shadow-sm">
              <p className="text-slate-500 dark:text-slate-400 text-base">
                No endpoints added yet. Add an endpoint from the Dashboard to see analytics.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}