import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ResponseTimeChart({ data }) {
  if (!data || data.length === 0) return <p className="text-gray-500">No response time data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="checkedAt" tick={{ fontSize: 12 }} />
        <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="responseTimeMs" stroke="#8884d8" name="Response Time (ms)" />
      </LineChart>
    </ResponsiveContainer>
  );
}