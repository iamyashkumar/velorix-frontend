import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiBarChart2, FiBell, FiCpu, FiLogIn, FiUserPlus, FiMoon, FiSun } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize Theme from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle Dark Mode Toggle
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
      setDarkMode(true);
    }
  };

  // Animation variants for staggered features loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 dark:bg-[#0b0f19] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">

      {/* Premium Background Decorative Ambient Blur (FANG Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 blur-3xl pointer-events-none z-0 select-none" />

      {/* Top Navbar Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-[#0b0f19]/70 border-b border-gray-200/50 dark:border-gray-800/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              Velorix
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              v1.0
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Icon Button Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300 transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {darkMode ? <FiSun size={18} className="text-yellow-400" /> : <FiMoon size={18} />}
            </button>
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-800 mb-6 tracking-wide uppercase">
              ✨ Next-gen production observability
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-[1.1]"
          >
            Intelligent Backend Monitoring{" "}
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              Powered by AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Monitor endpoints, collect unified application telemetry logs, get automated AI‑powered error root-cause diagnostics, and step up system health.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-xl shadow-xl shadow-blue-500/10 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all transform hover:-translate-y-0.5"
            >
              <FiUserPlus className="mr-2" size={18} /> Deploy Free Cluster
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3.5 border border-gray-200 dark:border-gray-800 text-base font-semibold rounded-xl shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/60 backdrop-blur hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none transition-all transform hover:-translate-y-0.5"
            >
              <FiLogIn className="mr-2" size={18} /> Console Log In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10 border-t border-gray-200/40 dark:border-gray-800/40">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Engineered for elite engineering teams
          </h2>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Everything you need to keep production service endpoints architecture functional.
          </p>
        </div>

        {/* Features Staggered Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100/50 dark:border-blue-900/20 text-blue-600 dark:text-blue-400">
              <FiActivity size={24} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Active Health Probing</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Automated pings across active runtime environments every 5 minutes to record continuous state availability.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/50 border border-green-100/50 dark:border-green-900/20 text-green-600 dark:text-green-400">
              <FiBarChart2 size={24} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Granular Telemetry Analytics</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Visualize millisecond‑precise latency curves, performance drops, and outliers over time-series charts.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100/50 dark:border-red-900/20 text-red-600 dark:text-red-400">
              <FiBell size={24} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Instant Threshold Incident Alerts</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Immediate event triggers dispatched instantly via Email webhooks and Telegram alerts when errors spike.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900/40 backdrop-blur-sm border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 shadow-sm transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100/50 dark:border-purple-900/20 text-purple-600 dark:text-purple-400">
              <FiCpu size={24} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">LLM Root-Cause Analysis</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Isolate stack traces instantly with clear human‑readable stack error breakdowns and suggested patches.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Minimalist Tech-Footer */}
      <footer className="bg-white dark:bg-[#0b0f19] border-t border-gray-200 dark:border-gray-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>
            &copy; {new Date().getFullYear()} Velorix Inc. All telemetry parameters operational.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-medium">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition">Security Info</a>
          </div>
        </div>
      </footer>
    </div>
  );
}