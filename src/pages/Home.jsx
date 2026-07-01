import { useNavigate } from 'react-router-dom';
import { useTheme, useAuth } from '../context/ThemeContext';

export default function Home() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 text-white">
      {/* Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative backdrop-blur-md bg-teal-800/30 border-b border-cyan-400/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
            Velorix
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all"
              aria-label="Toggle Theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => navigate('/status')}
              className="px-5 py-2 border border-green-400/40 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-300 text-sm font-semibold transition-all"
            >
              🟢 System Status
            </button>
            {token ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all text-white font-semibold"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/30 rounded-lg transition-all text-cyan-300 hover:text-cyan-100"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all text-white font-semibold"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 mb-8">
            <span>✨</span> Next-gen API Monitoring
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Monitor Your APIs{" "}
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              In Real-Time
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg md:text-xl text-cyan-300/70 max-w-2xl mx-auto font-normal leading-relaxed">
            Velorix is a powerful API monitoring platform with real-time alerts, advanced analytics, and AI-powered error diagnostics.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate(token ? '/dashboard' : '/register')}
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl shadow-xl shadow-cyan-500/20 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:-translate-y-0.5"
            >
              Start Monitoring Free
            </button>
            <button
              onClick={() => navigate('/status')}
              className="inline-flex items-center px-8 py-4 border border-cyan-400/30 text-base font-semibold rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all"
            >
              Check Live Status
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-cyan-400/20 mt-20 py-12 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-cyan-400/60">
            <div>
              &copy; {new Date().getFullYear()} Velorix. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 sm:mt-0 font-medium text-cyan-400/70">
              <a href="#privacy" className="hover:text-cyan-300 transition">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-cyan-300 transition">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}