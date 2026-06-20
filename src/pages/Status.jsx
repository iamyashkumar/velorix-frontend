import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://velorix-backend-vg5i.onrender.com';

export default function StatusPage() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/endpoints/public`);
      const endpointsList = Array.isArray(response.data) ? response.data : [];
      setEndpoints(endpointsList);
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300">Loading Status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 text-white">
      {/* Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto p-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Velorix Status
          </h1>
          <p className="text-cyan-300/70 text-lg">Real-time API Status Page</p>
        </div>

        {/* Overall Status */}
        <div className="mb-12 bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-3xl p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-3xl font-bold text-cyan-300">All Systems Operational</h2>
          </div>
          <p className="text-cyan-400/70">Last updated: {new Date().toLocaleString()}</p>
        </div>

        {/* Endpoints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint._id || endpoint.id}
              className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-6 hover:bg-cyan-500/25 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-cyan-300">{endpoint.name || endpoint.url}</h3>
                  <p className="text-cyan-400/60 text-sm mt-1 break-all">{endpoint.url}</p>
                </div>
                <div className={`w-4 h-4 rounded-full ${endpoint.active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  endpoint.active
                    ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                    : 'bg-red-500/30 text-red-300 border border-red-400/30'
                }`}>
                  {endpoint.active ? '🟢 UP' : '🔴 DOWN'}
                </span>
                <span className="text-cyan-400/70 text-xs">
                  {endpoint.lastChecked ? new Date(endpoint.lastChecked).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-cyan-400/60 text-sm">
          <p>Monitoring {endpoints.length} API endpoints</p>
          <p className="mt-2">Powered by Velorix</p>
        </div>
      </div>
    </div>
  );
}