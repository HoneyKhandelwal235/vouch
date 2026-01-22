"use client";
import { motion } from 'framer-motion';
import { Mail, Lock, User, Github, Chrome, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithEmail, signInWithGoogle, signInWithGithub } from '@/lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await signUpWithEmail(email, password, fullName);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        await signInWithGoogle();
    };

    const handleGithubSignup = async () => {
        setLoading(true);
        await signInWithGithub();
    };

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

            {/* Signup Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] p-10 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-black text-white mb-2">VOUCH</h1>
                        <p className="text-white/80 text-lg">Create your account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-2xl mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
                        <div>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 px-12 py-4 rounded-2xl focus:outline-none focus:border-white/40"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 px-12 py-4 rounded-2xl focus:outline-none focus:border-white/40"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password (min 6 characters)"
                                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 px-12 py-4 rounded-2xl focus:outline-none focus:border-white/40"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white hover:bg-white/90 text-[#4F75FF] py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-white/60">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            onClick={handleGoogleSignup}
                            disabled={loading}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <Chrome size={20} />
                            Google
                        </button>
                        <button
                            onClick={handleGithubSignup}
                            disabled={loading}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            <Github size={20} />
                            GitHub
                        </button>
                    </div>

                    <p className="text-center text-white/60 text-sm">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-white font-bold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
