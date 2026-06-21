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
          <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
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
              🚀 {token ? 'Go to Dashboard' : 'Start Monitoring'}
            </button>
            <button
              onClick={() => navigate('/status')}
              className="inline-flex items-center px-8 py-4 border-2 border-cyan-400/50 text-base font-semibold rounded-xl text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all transform hover:-translate-y-0.5"
            >
              📊 View Status Page
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-cyan-400/20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-cyan-300 sm:text-5xl">
            Powerful Features
          </h2>
          <p className="mt-4 text-lg text-cyan-300/70 max-w-2xl mx-auto">
            Everything you need to monitor and optimize your API infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Feature Cards */}
          {[
            {
              icon: '📊',
              title: 'Real-Time Monitoring',
              description: 'Monitor API health and performance metrics in real-time with instant notifications.'
            },
            {
              icon: '📈',
              title: 'Advanced Analytics',
              description: 'Get detailed insights with millisecond-precise latency curves and performance trends.'
            },
            {
              icon: '🔔',
              title: 'Smart Alerts',
              description: 'Instant notifications when errors spike or thresholds are exceeded.'
            },
            {
              icon: '🤖',
              title: 'AI-Powered Analysis',
              description: 'Let AI analyze errors and suggest fixes automatically with root-cause diagnostics.'
            },
            {
              icon: '📋',
              title: 'Comprehensive Logs',
              description: 'View detailed logs of all API requests, responses, and health checks.'
            },
            {
              icon: '⚡',
              title: 'Performance Tracking',
              description: 'Track response times and identify performance bottlenecks instantly.'
            },
            {
              icon: '🌍',
              title: 'Global Monitoring',
              description: 'Monitor endpoints from multiple regions and get geographic insights.'
            },
            {
              icon: '🔐',
              title: 'Secure & Reliable',
              description: 'Enterprise-grade security with encryption and compliance standards.'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-8 hover:bg-cyan-500/25 transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-cyan-300 mb-3">{feature.title}</h3>
              <p className="text-cyan-400/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-20">
          {[
            { label: 'APIs Monitored', value: '10K+' },
            { label: 'Uptime Guarantee', value: '99.9%' },
            { label: 'Detection Time', value: '<1m' }
          ].map((stat, i) => (
            <div key={i} className="bg-cyan-500/15 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-8 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-cyan-300/70 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md border-2 border-cyan-400/50 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6 text-cyan-300">
            Ready to Monitor Your APIs?
          </h2>
          <p className="text-xl text-cyan-300/70 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust Velorix for API monitoring and optimization.
          </p>
          <button
            onClick={() => navigate(token ? '/dashboard' : '/register')}
            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            🎯 Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-cyan-400/20 mt-20 py-12 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-cyan-400/60">
            <div>
              &copy; {new Date().getFullYear()} Velorix. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 sm:mt-0 font-medium text-cyan-400/70 hover:text-cyan-300 transition-colors">
              <a href="#privacy" className="hover:text-cyan-300 transition">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-cyan-300 transition">
                Terms of Service
              </a>
              <a href="#security" className="hover:text-cyan-300 transition">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}