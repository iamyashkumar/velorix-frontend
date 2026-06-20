import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    toast.success('Logged out');
    navigate('/login');
  };

  const handleAiAnalysis = () => {
    toast.success('Analyzing recent errors with AI...');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#07161b] text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 relative w-full overflow-x-hidden ${
      darkMode
        ? 'bg-[#091a22] text-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-950/40 via-[#091a22] to-[#051016]'
        : 'bg-gray-50 text-gray-900'
    }`}>

      {/* Sidebar - FIXED Side Panel */}
      <aside className={`fixed top-0 left-0 w-64 h-screen p-6 flex flex-col justify-between border-r backdrop-blur-md z-50 ${
        darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'
      }`}>
        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Velorix
            </h1>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className={`w-full px-4 py-3 border rounded-xl text-left flex items-center gap-3 font-medium transition-all ${
                darkMode ? 'bg-white/10 border-white/10 text-white' : 'bg-cyan-50 border-cyan-100 text-cyan-700'
              }`}
            >
              <span className="text-lg">📊</span> Dashboard
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className={`w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 font-medium transition-all ${
                darkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">📈</span> Analytics
            </button>
            <button
              onClick={() => navigate('/logs')}
              className={`w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 font-medium transition-all ${
                darkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">📋</span> Logs
            </button>
          </nav>
        </div>

        <div className={`space-y-4 pt-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 px-2 text-sm text-gray-400">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>👤</div>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700 font-medium'}>User Profile</span>
          </div>

          {/* Theme Toggle Button - Enhanced with Icons */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200 shadow-sm'}`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Theme Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full p-0.5 border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                darkMode ? 'bg-cyan-950 border-cyan-500/50' : 'bg-amber-100 border-amber-400'
              }`}
            >
              <span
                className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  darkMode ? 'translate-x-7 bg-cyan-400' : 'translate-x-0 bg-amber-400'
                }`}
              >
                {darkMode ? '🌙' : '☀️'}
              </span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full px-4 py-2 bg-transparent border rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium ${
              darkMode ? 'hover:bg-red-500/10 border-red-500/30 text-red-400' : 'hover:bg-red-50 border-red-200 text-red-600'
            }`}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen p-8 pl-72 w-full box-border">
        <div className="w-full max-w-[1400px] mx-auto">

          {/* Dashboard Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-wide">Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">Analyze and manage your API endpoints</p>
          </div>

          {/* Top Section: Form & Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 w-full">

            {/* Left Form Panel */}
            <div className="lg:col-span-5 flex flex-col gap-4 w-full">
              <div className={`border rounded-2xl p-5 shadow-2xl backdrop-blur-md transition-all ${
                darkMode ? 'bg-gradient-to-b from-white/10 to-white/5 border-cyan-500/40' : 'bg-white border-cyan-200'
              }`}>
                <div className="text-cyan-500 font-semibold mb-4 flex items-center gap-2">
                  <span>+</span> Add New Endpoint
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Endpoint Name (e.g., Google API)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-cyan-400 text-sm transition-all ${
                      darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    disabled={addingEndpoint}
                  />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEndpoint()}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-cyan-400 text-sm transition-all ${
                      darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                    disabled={addingEndpoint}
                  />
                  <button
                    onClick={addEndpoint}
                    disabled={addingEndpoint}
                    className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-50 text-black font-bold rounded-xl transition-all text-sm tracking-wide shadow-lg shadow-cyan-400/20"
                  >
                    {addingEndpoint ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>

              {/* AI Analysis Button */}
              <button
                onClick={handleAiAnalysis}
                className={`w-full py-3 px-4 border rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 border-indigo-500/40 hover:border-indigo-400/60 text-white'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                🧠 Analyze Recent Errors with AI
              </button>
            </div>

            {/* Right Stats Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="bg-gradient-to-br from-blue-600 to-blue-500/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl text-white min-h-[120px]">
                <div className="flex justify-between items-center text-white/80">
                  <span className="text-sm font-medium">Total APIs</span>
                  <span className="text-lg">🎛️</span>
                </div>
                <div className="text-2xl font-bold mt-2">Total APIs</div>
                <div className="text-xs text-white/60">Count: {stats.total}</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl text-white min-h-[120px]">
                <div className="flex justify-between items-center text-white/80">
                  <span className="text-sm font-medium">↑ UP</span>
                  <span className="text-lg">▲</span>
                </div>
                <div className="text-2xl font-bold mt-2">UP</div>
                <div className="text-xs text-white/60">Active: {stats.up}</div>
              </div>

              <div className="bg-gradient-to-br from-rose-600 to-rose-500/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl text-white min-h-[120px]">
                <div className="flex justify-between items-center text-white/80">
                  <span className="text-sm font-medium">↓ DOWN</span>
                  <span className="text-lg">▼</span>
                </div>
                <div className="text-2xl font-bold mt-2">DOWN</div>
                <div className="text-xs text-white/60">Inactive: {stats.down}</div>
              </div>

              <div className="bg-gradient-to-br from-amber-600 to-amber-500/80 p-5 rounded-2xl flex flex-col justify-between shadow-xl text-white min-h-[120px]">
                <div className="flex justify-between items-center text-white/80">
                  <span className="text-sm font-medium">Avg Response</span>
                  <span className="text-lg">📈</span>
                </div>
                <div className="text-2xl font-bold mt-2">Avg Response</div>
                <div className="text-xs text-white/60">{stats.avgResponseTime}ms</div>
              </div>
            </div>

          </div>

          {/* Bottom Section: Monitored Endpoints & Graph Trend Fused Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">

            {/* Left: Monitored Endpoints List */}
            <div className={`lg:col-span-5 border rounded-2xl p-5 backdrop-blur-md w-full h-[400px] flex flex-col justify-between ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div>
                <div className="text-sm font-medium mb-4 flex items-center gap-2 text-gray-400">
                  <span>📍</span> Monitored Endpoints
                </div>

                {endpoints.length === 0 ? (
                  <p className="text-gray-400 text-center py-6 text-sm">No endpoints yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {endpoints.map((ep) => {
                      const isUp = ep.active || ep.status === 'UP';
                      const epId = ep._id || ep.id;
                      return (
                        <div
                          key={epId}
                          onClick={() => handleEndpointClick(ep)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedEndpoint && (selectedEndpoint._id || selectedEndpoint.id) === epId
                              ? (darkMode ? 'bg-white/15 border-cyan-500/50' : 'bg-cyan-50 border-cyan-300')
                              : (darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100')
                          }`}
                        >
                          <div className="truncate flex-1 pr-2">
                            <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{ep.name || ep.url}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{ep.url}</p>
                            <p className="text-[11px] text-gray-500 mt-1">
                              Latest response time: {latestHealth[epId] ? `${latestHealth[epId]}ms` : '30ms'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isUp ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'
                            }`}>
                              {isUp ? '● UP' : '● DOWN'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEndpoint(epId);
                              }}
                              className={`p-1.5 border rounded-lg text-xs transition-all ${
                                darkMode ? 'bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border-white/10' : 'bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border-gray-200'
                              }`}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Response Time Trend Graph */}
            <div className={`lg:col-span-7 border rounded-2xl p-5 h-[400px] flex flex-col justify-between backdrop-blur-md w-full ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <span>📉</span> Response Time Trend
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Endpoint
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span> Trend Curve
                  </span>
                </div>
              </div>

              <div className="w-full flex-1 min-h-[280px] flex items-center justify-center overflow-hidden">
                {loadingChart ? (
                  <p className="text-gray-400 text-sm">Loading trend data...</p>
                ) : chartData.length === 0 && !selectedEndpoint ? (
                  <p className="text-gray-400 text-sm">Select an endpoint to view trend data</p>
                ) : chartData.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data available for this endpoint</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#ffffff10' : '#e5e7eb'} vertical={false} />
                      <XAxis dataKey="checkedAt" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                          borderRadius: '12px',
                          color: darkMode ? '#ffffff' : '#000000'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="responseTimeMs"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        dot={{ fill: '#22d3ee', strokeWidth: 1, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}