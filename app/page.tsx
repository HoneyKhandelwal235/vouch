"use client";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Heart, PieChart } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#4F75FF] via-[#7B68EE] to-[#FF6B9D] flex items-center justify-center p-6">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"
        />
      </div>

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Glassmorphism Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] p-12 shadow-2xl">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl font-black text-white mb-4 tracking-tighter"
            >
              VOUCH
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-xl font-medium mb-8"
            >
              Your Premium Finance Studio
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/60 text-sm max-w-md mx-auto"
            >
              Track expenses, scan receipts with OCR, visualize spending trends, and manage your finances with style.
            </motion.p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <TrendingUp className="text-white mb-3" size={32} />
              <h3 className="text-white font-bold mb-2">Track Spending</h3>
              <p className="text-white/60 text-sm">Monitor your expenses in real-time</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <Heart className="text-white mb-3" size={32} />
              <h3 className="text-white font-bold mb-2">OCR Scanner</h3>
              <p className="text-white/60 text-sm">Upload receipts, auto-extract data</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <PieChart className="text-white mb-3" size={32} />
              <h3 className="text-white font-bold mb-2">Visualizations</h3>
              <p className="text-white/60 text-sm">Beautiful charts and insights</p>
            </motion.div>
          </div>

          {/* Enter Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            className="w-full bg-white hover:bg-white/95 text-[#4F75FF] py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl"
          >
            Enter App
            <ArrowRight size={24} />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/40 text-xs text-center mt-6"
          >
            No login required • Start tracking instantly
          </motion.p>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl opacity-80 blur-sm"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-300 to-blue-400 rounded-full opacity-70 blur-sm"
        />
      </motion.div>
    </main>
  );
}