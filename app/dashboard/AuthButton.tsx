"use client";
import { signOut, useSession } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthButton() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    return (
        <div className="flex items-center gap-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-zinc-200 hover:bg-white transition-all"
                title="Sign Out"
            >
                <LogOut size={20} className="text-zinc-600" />
            </motion.button>

            <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#4F75FF] to-[#7B68EE] text-white flex items-center justify-center font-bold shadow-lg cursor-pointer"
                title={session.user.name || session.user.email || 'User'}
            >
                {session.user.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-full h-full rounded-2xl object-cover"
                    />
                ) : (
                    <User size={24} />
                )}
            </motion.div>
        </div>
    );
}
