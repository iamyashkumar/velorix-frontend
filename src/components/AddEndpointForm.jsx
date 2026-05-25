import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AddEndpointForm({ onEndpointAdded }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/endpoints', {
        name,
        url,
        active: true,
        checkIntervalSeconds: 300
      });
      toast.success('Endpoint added successfully');
      setName('');
      setUrl('');
      if (onEndpointAdded) onEndpointAdded(response.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add endpoint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
      <h3 className="text-md font-semibold mb-3">Add New Endpoint</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Name (e.g., Google)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          required
        />
        <input
          type="url"
          placeholder="URL (e.g., https://www.google.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : '+ Add Endpoint'}
        </button>
      </form>
    </div>
  );
}