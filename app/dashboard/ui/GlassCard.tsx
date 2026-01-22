"use client";
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'light' | 'dark' | 'card';
    hover?: boolean;
}

export default function GlassCard({ children, className = '', variant = 'card', hover = false }: GlassCardProps) {
    const baseClasses = {
        light: 'glass',
        dark: 'glass-dark',
        card: 'glass-card',
    };

    return (
        <motion.div
            whileHover={hover ? { scale: 1.02, y: -4 } : {}}
            className={`${baseClasses[variant]} rounded-3xl ${className}`}
        >
            {children}
        </motion.div>
    );
}
