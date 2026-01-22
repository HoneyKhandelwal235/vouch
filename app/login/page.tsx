"use client";
import { signIn } from 'next-auth/react';
import { Github, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
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

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Glassmorphism Card */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] p-12 shadow-2xl">
                    <div className="text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl font-black text-white mb-3 tracking-tighter"
                        >
                            VOUCH
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/70 text-sm font-medium"
                        >
                            Your Premium Finance Studio
                        </motion.p>
                    </div>

                    <div className="space-y-4">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signIn('github', { callbackUrl: '/' })}
                            className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Github size={22} />
                            Continue with GitHub
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            className="w-full bg-white hover:bg-white/95 text-gray-800 py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Chrome size={22} />
                            Continue with Google
                        </motion.button>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-white/50 text-xs text-center mt-8"
                    >
                        Secure authentication powered by NextAuth
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
