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
      <div className="flex items-center justify-center min-h-screen bg-[#071317]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#071317] text-gray-900 dark:text-gray-100 md:flex transition-colors duration-300">

      {/* Mobile Top Navbar - Exact Theme Match */}
      <div className="w-full flex items-center justify-between p-4 bg-white dark:bg-[#0c1e24] border-b border-gray-200 dark:border-cyan-950 md:hidden sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#122b33] transition text-gray-700 dark:text-cyan-400"
          >
            <FiMenu size={24} />
          </button>
          <span className="text-lg font-bold tracking-tight text-cyan-600 dark:text-cyan-400">Velorix</span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#122b33] transition"
        >
          {darkMode ? <FiSun size={22} className="text-amber-400" /> : <FiMoon size={22} />}
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden bg-gray-50 dark:bg-[#071317]">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Analyze and manage your API endpoints</p>
          </div>

          {/* Days Filter */}
          <div className="mb-6 flex gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  days === d
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'bg-white dark:bg-[#11252d] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-cyan-950 hover:bg-gray-100 dark:hover:bg-[#16313b]'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>

          {/* Summary Stats - Image Colors Matched Precisely */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Endpoints - Royal Blue */}
              <div className="bg-[#2b6cb0] dark:bg-[#2563eb] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Total APIs</p>
                <p className="text-3xl font-bold mt-2 tracking-tight">Total APIs</p>
                <p className="text-sm text-white/70 mt-1">Count: {summary.totalEndpoints}</p>
                <span className="absolute bottom-4 right-4 text-xl opacity-20">🌐</span>
              </div>

              {/* Uptime - Emerald Green */}
              <div className="bg-[#2f855a] dark:bg-[#10b981] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">↑ UP</p>
                <p className="text-3xl font-bold mt-2 tracking-tight">UP</p>
                <p className="text-sm text-white/70 mt-1">Uptime: {summary.uptimePercentage}%</p>
                <span className="absolute bottom-4 right-4 text-xl opacity-20">▲</span>
              </div>

              {/* Avg Response - Orange / Gold */}
              <div className="bg-[#c05621] dark:bg-[#d97706] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Avg Response</p>
                <p className="text-3xl font-bold mt-2 tracking-tight">Avg Response</p>
                <p className="text-sm text-white/70 mt-1">{summary.averageResponseTime}ms</p>
                <span className="absolute bottom-4 right-4 text-xl opacity-20">⚡</span>
              </div>

              {/* SLA Status - Rose / Pinkish Red */}
              <div className="bg-[#c53030] dark:bg-[#e11d48] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">↓ STATUS</p>
                <p className="text-3xl font-bold mt-2 tracking-tight">{summary.slaStatus}</p>
                <p className="text-sm text-white/70 mt-1">SLA Healthy</p>
                <span className="absolute bottom-4 right-4 text-xl opacity-20">✨</span>
              </div>
            </div>
          )}

          {/* Endpoint Selector - Dark Custom Background */}
          {endpoints.length > 0 && (
            <div className="bg-white dark:bg-[#0c1e24] border border-gray-200 dark:border-cyan-950 rounded-2xl p-6 mb-8 shadow-sm">
              <label className="text-gray-900 dark:text-cyan-400 font-semibold text-sm mb-3 block">Select Endpoint</label>
              <select
                value={selectedEndpointId || ''}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-cyan-900/50 rounded-xl bg-white dark:bg-[#11252d] dark:text-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
              >
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id} className="dark:bg-[#0c1e24] text-gray-950 dark:text-white">
                    {ep.name} — {ep.url}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Endpoint Detailed Analytics - Dark Panel style matching "Monitored Endpoints" */}
          {endpointAnalytics && (
            <div className="bg-white dark:bg-[#0c1e24] border border-gray-200 dark:border-cyan-950 rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                📊 {endpointAnalytics.endpointName} — Detailed Analytics
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-[#11252d] p-4 rounded-xl border border-gray-200 dark:border-cyan-950/40">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Uptime</p>
                  <p className="text-xl font-bold text-emerald-500 mt-1">{endpointAnalytics.uptimePercentage}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#11252d] p-4 rounded-xl border border-gray-200 dark:border-cyan-950/40">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Avg Response</p>
                  <p className="text-xl font-bold text-cyan-400 mt-1">{endpointAnalytics.averageResponseTime}ms</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#11252d] p-4 rounded-xl border border-gray-200 dark:border-cyan-950/40">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Total Checks</p>
                  <p className="text-xl font-bold text-blue-400 mt-1">{endpointAnalytics.totalChecks}</p>
                </div>
                <div className="bg-gray-50 dark:bg-[#11252d] p-4 rounded-xl border border-gray-200 dark:border-cyan-950/40">
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Failure Rate</p>
                  <p className="text-xl font-bold text-rose-500 mt-1">{endpointAnalytics.failureRate}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Charts Area - Styled precisely like "Response Time Trend" container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uptime Trend Chart */}
            {trendData.length > 0 && (
              <div className="bg-white dark:bg-[#0c1e24] border border-gray-200 dark:border-cyan-950 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">📈 Uptime Trend</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(14, 116, 144, 0.1)" : "rgba(0,0,0,0.05)"} />
                    <XAxis dataKey="date" stroke="#475569" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#475569" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: darkMode ? '#0c1e24' : '#ffffff', border: darkMode ? '1px solid #164e63' : '1px solid #e2e8f0', borderRadius: '12px' }}
                      labelStyle={{ color: darkMode ? '#fff' : '#000' }}
                    />
                    <Line type="monotone" dataKey="uptime" name="Uptime %" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Response Time Trend Chart */}
            {trendData.length > 0 && (
              <div className="bg-white dark:bg-[#0c1e24] border border-gray-200 dark:border-cyan-950 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">⚡ Response Time Trend</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(14, 116, 144, 0.1)" : "rgba(0,0,0,0.05)"} />
                    <XAxis dataKey="date" stroke="#475569" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#475569" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: darkMode ? '#0c1e24' : '#ffffff', border: darkMode ? '1px solid #164e63' : '1px solid #e2e8f0', borderRadius: '12px' }}
                      labelStyle={{ color: darkMode ? '#fff' : '#000' }}
                    />
                    <Bar dataKey="avgResponseTime" name="Avg Response (ms)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Empty State */}
          {endpoints.length === 0 && (
            <div className="bg-white dark:bg-[#0c1e24] border border-gray-200 dark:border-cyan-950 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-500 dark:text-gray-400">
                No endpoints added yet. Add an endpoint from the Dashboard to see analytics.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}