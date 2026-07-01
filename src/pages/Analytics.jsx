import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme, useAuth } from '../context/ThemeContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = 'https://velorix-backend-vg5i.onrender.com';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalRequests: 0,
    avgResponseTime: 0,
    successRate: 0,
    errorRate: 0,
    requestsOverTime: [],
    statusDistribution: [],
    topEndpoints: [],
    responseTimeByEndpoint: []
  });
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
    fetchAnalytics();
  }, [navigate, token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/analytics/summary`, getAuthHeader());
      setAnalyticsData(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading Analytics...</p>
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
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100"
          >
            <span>📊</span> <span className="font-semibold">Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full px-4 py-3 bg-cyan-500/30 border border-cyan-400/40 rounded-xl text-left flex items-center gap-3 text-cyan-100"
          >
            <span>📈</span> <span className="font-semibold">Analytics</span>
          </button>
          <button
            onClick={() => navigate('/logs')}
            className="w-full px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/20 rounded-xl transition-all text-left flex items-center gap-3 text-cyan-300 hover:text-cyan-100"
          >
            <span>📋</span> <span className="font-semibold">Logs</span>
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
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-xl transition-all text-left flex items-center gap-3 text-red-300 font-semibold"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 relative overflow-y-auto z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Analytics Summary</h2>
            <p className="text-cyan-300/70 text-sm mt-1">Detailed performance metrics across all endpoints</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-cyan-500/15 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <p className="text-cyan-400/60 text-sm font-semibold uppercase tracking-wider">Total Hits</p>
            <h3 className="text-3xl font-bold text-white mt-2">{analyticsData.totalRequests}</h3>
          </div>
          <div className="bg-cyan-500/15 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <p className="text-cyan-400/60 text-sm font-semibold uppercase tracking-wider">Avg Latency</p>
            <h3 className="text-3xl font-bold text-cyan-300 mt-2">{analyticsData.avgResponseTime}ms</h3>
          </div>
          <div className="bg-cyan-500/15 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <p className="text-cyan-400/60 text-sm font-semibold uppercase tracking-wider">Success Rate</p>
            <h3 className="text-3xl font-bold text-green-400 mt-2">{analyticsData.successRate}%</h3>
          </div>
          <div className="bg-cyan-500/15 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-6">
            <p className="text-cyan-400/60 text-sm font-semibold uppercase tracking-wider">Error Rate</p>
            <h3 className="text-3xl font-bold text-red-400 mt-2">{analyticsData.errorRate}%</h3>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Requests Over Time */}
          <div className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Traffic Trend</h3>
            {analyticsData.requestsOverTime && analyticsData.requestsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" h={300}>
                <LineChart data={analyticsData.requestsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0891b2" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#22d3ee" />
                  <YAxis stroke="#22d3ee" />
                  <Tooltip contentStyle={{ backgroundColor: '#0e7490', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-8 text-cyan-400/60">No traffic data available</p>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Status Distribution</h3>
            {analyticsData.statusDistribution && analyticsData.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" h={300}>
                <BarChart data={analyticsData.statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0891b2" opacity={0.2} />
                  <XAxis dataKey="status" stroke="#22d3ee" />
                  <YAxis stroke="#22d3ee" />
                  <Tooltip contentStyle={{ backgroundColor: '#0e7490', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-8 text-cyan-400/60">No data available</p>
            )}
          </div>
        </div>

        {/* Top Endpoints */}
        {analyticsData.topEndpoints && analyticsData.topEndpoints.length > 0 && (
          <div className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
              <span>🏆</span> Top Endpoints
            </h3>
            <div className="space-y-3">
              {analyticsData.topEndpoints.map((ep, i) => (
                <div key={i} className="bg-cyan-900/40 border border-cyan-400/30 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-cyan-300">{ep.name || ep.url}</p>
                    <p className="text-cyan-400/60 text-sm">{ep.url}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-300 font-bold">{ep.requests || 0} requests</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}