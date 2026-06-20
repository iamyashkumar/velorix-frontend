import { useEffect, useState } from 'react';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { FiMenu, FiTrash2 } from 'react-icons/fi';
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
    <div className="min-h-screen bg-[#071317] text-gray-100 md:flex transition-colors duration-300">

      {/* Mobile Top Navbar */}
      <div className="w-full flex items-center justify-between p-4 bg-[#0c1e24] border-b border-cyan-950 md:hidden sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-xl hover:bg-[#122b33] transition text-cyan-400"
          >
            <FiMenu size={24} />
          </button>
          <span className="text-lg font-bold tracking-tight text-cyan-400">Velorix</span>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden bg-[#071317]">
        <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8">

          {/* Grid Layout: Top Controls & Dashboard Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

            {/* Left Box: Controls & Filter Selection */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Analyze and manage your API endpoints</p>
              </div>

              {/* Days Filter Buttons */}
              <div className="flex gap-2">
                {[7, 14, 30].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all duration-200 ${
                      days === d
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                        : 'bg-[#11252d] text-gray-300 border border-cyan-950 hover:bg-[#16313b]'
                    }`}
                  >
                    Last {d} Days
                  </button>
                ))}
              </div>

              {/* Selector Style match */}
              {endpoints.length > 0 && (
                <div className="bg-[#0c1e24] border border-cyan-950 rounded-2xl p-4 shadow-sm">
                  <label className="text-cyan-400 font-semibold text-xs mb-2 block">Active Dynamic Scope</label>
                  <select
                    value={selectedEndpointId || ''}
                    onChange={(e) => setSelectedEndpointId(e.target.value)}
                    className="w-full p-2.5 border border-cyan-900/50 rounded-xl bg-[#11252d] text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
                  >
                    {endpoints.map((ep) => (
                      <option key={ep.id} value={ep.id} className="bg-[#0c1e24] text-white">
                        {ep.name} — {ep.url}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Box: 4 Core Cards Dashboard (Perfect Color Alignment) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Total APIs - Royal Blue */}
              <div className="bg-[#2563eb] rounded-2xl p-5 text-white flex flex-col justify-between relative shadow-md">
                <div>
                  <div className="flex justify-between items-center text-white/80 text-xs font-bold uppercase tracking-wider">
                    <span>Total APIs</span>
                    <span className="text-base">🎛️</span>
                  </div>
                  <p className="text-3xl font-black mt-3">Total APIs</p>
                </div>
                <p className="text-xs text-white/70 mt-4">Count: {summary ? summary.totalEndpoints : '0'}</p>
              </div>

              {/* Uptime - Emerald Green */}
              <div className="bg-[#10b981] rounded-2xl p-5 text-white flex flex-col justify-between relative shadow-md">
                <div>
                  <div className="flex justify-between items-center text-white/80 text-xs font-bold uppercase tracking-wider">
                    <span>↑ UP</span>
                    <span className="text-base">▲</span>
                  </div>
                  <p className="text-3xl font-black mt-3">UP</p>
                </div>
                <p className="text-xs text-white/70 mt-4">Active: {summary ? Math.round(summary.totalEndpoints * (summary.uptimePercentage / 100)) : '0'}</p>
              </div>

              {/* SLA Status / DOWN - Rose Red */}
              <div className="bg-[#e11d48] rounded-2xl p-5 text-white flex flex-col justify-between relative shadow-md">
                <div>
                  <div className="flex justify-between items-center text-white/80 text-xs font-bold uppercase tracking-wider">
                    <span>↓ DOWN</span>
                    <span className="text-base">▼</span>
                  </div>
                  <p className="text-3xl font-black mt-3">DOWN</p>
                </div>
                <p className="text-xs text-white/70 mt-4">Status / Inactive: {summary?.slaStatus || '0'}</p>
              </div>

              {/* Avg Response - Amber Orange */}
              <div className="bg-[#d97706] rounded-2xl p-5 text-white flex flex-col justify-between relative shadow-md">
                <div>
                  <div className="flex justify-between items-center text-white/80 text-xs font-bold uppercase tracking-wider">
                    <span>Avg Response</span>
                    <span className="text-base">📈</span>
                  </div>
                  <p className="text-3xl font-black mt-3">Avg Response</p>
                </div>
                <p className="text-xs text-white/70 mt-4">{summary ? `${summary.averageResponseTime}ms` : '0ms'}</p>
              </div>

            </div>
          </div>

          {/* Endpoint Analytics Stats (If Selected) */}
          {endpointAnalytics && (
            <div className="bg-[#0c1e24] border border-cyan-950 rounded-2xl p-4 mb-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-[#11252d] p-3 rounded-xl border border-cyan-950/40">
                  <p className="text-gray-400 text-xs">Uptime</p>
                  <p className="text-lg font-bold text-emerald-500 mt-0.5">{endpointAnalytics.uptimePercentage}%</p>
                </div>
                <div className="bg-[#11252d] p-3 rounded-xl border border-cyan-950/40">
                  <p className="text-gray-400 text-xs">Avg Response</p>
                  <p className="text-lg font-bold text-cyan-400 mt-0.5">{endpointAnalytics.averageResponseTime}ms</p>
                </div>
                <div className="bg-[#11252d] p-3 rounded-xl border border-cyan-950/40">
                  <p className="text-gray-400 text-xs">Checks</p>
                  <p className="text-lg font-bold text-blue-400 mt-0.5">{endpointAnalytics.totalChecks}</p>
                </div>
                <div className="bg-[#11252d] p-3 rounded-xl border border-cyan-950/40">
                  <p className="text-gray-400 text-xs">Failure Rate</p>
                  <p className="text-lg font-bold text-rose-500 mt-0.5">{endpointAnalytics.failureRate}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Twin Column Dashboard Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Column Left: Monitored Endpoints Panel */}
            <div className="lg:col-span-5 bg-[#0c1e24] border border-cyan-950 rounded-2xl p-5 shadow-sm min-h-[380px]">
              <div className="flex items-center space-x-2 text-gray-300 text-sm font-semibold mb-4">
                <span className="text-rose-500">📍</span>
                <h2>Monitored Endpoints</h2>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {endpoints.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => setSelectedEndpointId(ep.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedEndpointId === ep.id
                        ? 'bg-[#122c36] border-cyan-500/50'
                        : 'bg-[#11252d] border-cyan-950/60 hover:bg-[#152e38]'
                    }`}
                  >
                    <div className="truncate mr-3">
                      <p className="text-white font-bold text-sm truncate">{ep.name}</p>
                      <p className="text-gray-400 text-xs truncate mt-0.5">{ep.url}</p>
                      {selectedEndpointId === ep.id && endpointAnalytics && (
                        <p className="text-[10px] text-cyan-400/80 mt-1">Latest response time: {endpointAnalytics.averageResponseTime}ms</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="bg-[#10b981]/20 text-[#10b981] font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-[#10b981]/30">
                        • UP
                      </span>
                      <button className="text-gray-500 hover:text-rose-400 p-1 rounded-md transition">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {endpoints.length === 0 && (
                  <p className="text-gray-500 text-xs text-center py-8">No endpoints monitored yet.</p>
                )}
              </div>
            </div>

            {/* Column Right: Charts Layout Panel (Response Time / Trend View) */}
            <div className="lg:col-span-7 bg-[#0c1e24] border border-cyan-950 rounded-2xl p-5 shadow-sm min-h-[380px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 text-gray-300 text-sm font-semibold">
                  <span>📉</span>
                  <h2>Response Time Trend</h2>
                </div>
                <div className="flex items-center space-x-4 text-[11px] text-gray-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>Endpoint</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Trend Curve</span>
                  </div>
                </div>
              </div>

              {trendData.length > 0 ? (
                <div className="space-y-6">
                  {/* Performance Chart Splitter */}
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(14, 116, 144, 0.08)" />
                      <XAxis dataKey="date" stroke="#475569" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#475569" style={{ fontSize: '11px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0c1e24', border: '1px solid #164e63', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="avgResponseTime" name="Response (ms)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[260px]">
                  <p className="text-gray-500 text-xs">Select an endpoint to view trend data</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}