import { Link } from 'react-router-dom';
import { FiActivity, FiBarChart2, FiBell, FiCpu, FiLogIn, FiUserPlus } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
            Velorix
            <span className="block text-blue-600 dark:text-blue-400">AI-Powered Backend Monitoring</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Monitor your APIs, collect logs, get instant AI‑powered error explanations, and receive alerts – all in one dashboard.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiLogIn className="mr-2" /> Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiUserPlus className="mr-2" /> Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Key Features</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Everything you need to keep your backend healthy.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
            <div className="flex justify-center">
              <FiActivity className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Health Checks</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Automatically ping your APIs every 5 minutes and track uptime.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
            <div className="flex justify-center">
              <FiBarChart2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Response Time Charts</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Visualise latency trends over the last 24 hours.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
            <div className="flex justify-center">
              <FiBell className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Email & Telegram Alerts</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Get notified when error thresholds are exceeded.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center">
            <div className="flex justify-center">
              <FiCpu className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">AI Debugging</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Get plain‑English explanations and fix recommendations.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Velorix. All rights reserved.
        </div>
      </footer>
    </div>
  );
}