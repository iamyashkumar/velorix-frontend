import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/ThemeContext';

const API_BASE = 'https://velorix-backend-vg5i.onrender.com';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      login(user || { email }, token);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed! Check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 flex items-center justify-center p-4">
      {/* Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
              Velorix
            </h1>
            <p className="text-cyan-300/70 text-sm mt-2 tracking-wider">SIGN IN TO ACCOUNT</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-cyan-900/40 border border-cyan-400/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-cyan-400/50 transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-cyan-300 text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-cyan-900/40 border border-cyan-400/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-cyan-400/50 transition-all"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-xl font-bold text-white disabled:opacity-50 transition-all shadow-lg mt-6"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-cyan-400/20"></div>
            <span className="px-3 text-cyan-400/60 text-sm">or</span>
            <div className="flex-1 h-px bg-cyan-400/20"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-cyan-300/70">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Register here
            </button>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-xl text-center">
            <p className="text-xs text-cyan-300 font-medium">✨ Demo Access Credentials:</p>
            <p className="text-xs text-cyan-400/70 mt-1">Email: admin@velorix.com | Pass: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}