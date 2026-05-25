import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    fetchLogs();
  }, [level, keyword, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (level) params.level = level;
      if (keyword) params.keyword = keyword;
      const response = await api.get('/api/logs', { params });
      setLogs(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading logs...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Log Viewer</h2>
      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          value={level}
          onChange={(e) => { setLevel(e.target.value); setPage(0); }}
          className="p-2 border rounded dark:bg-gray-800"
        >
          <option value="">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>
        <input
          type="text"
          placeholder="Search by message"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
          className="p-2 border rounded flex-1 dark:bg-gray-800"
        />
        <button onClick={fetchLogs} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </div>
      <div className="space-y-2">
        {logs.length === 0 && <p>No logs found.</p>}
        {logs.map(log => (
          <div key={log.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow">
            <div className="flex justify-between">
              <span className={`font-bold ${log.level === 'ERROR' ? 'text-red-600' : log.level === 'WARN' ? 'text-yellow-600' : 'text-green-600'}`}>
                {log.level}
              </span>
              <span className="text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <p>{log.message}</p>
            <p className="text-sm text-gray-500">Source: {log.source || 'N/A'}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(p => p-1)}
          className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page+1} of {totalPages}</span>
        <button
          disabled={page+1 >= totalPages}
          onClick={() => setPage(p => p+1)}
          className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}