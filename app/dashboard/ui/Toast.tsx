"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

let toastQueue: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

export function showToast(message: string, type: ToastType = 'info') {
    const toast: Toast = {
        id: Math.random().toString(36).substring(7),
        message,
        type,
    };

    toastQueue = [...toastQueue, toast];
    listeners.forEach(listener => listener(toastQueue));

    setTimeout(() => {
        toastQueue = toastQueue.filter(t => t.id !== toast.id);
        listeners.forEach(listener => listener(toastQueue));
    }, 4000);
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        listeners.push(setToasts);
        return () => {
            listeners = listeners.filter(l => l !== setToasts);
        };
    }, []);

    const removeToast = (id: string) => {
        toastQueue = toastQueue.filter(t => t.id !== id);
        setToasts(toastQueue);
    };

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: Info,
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
        <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => {
                    const Icon = icons[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.8 }}
                            className={`${colors[toast.type]} border rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-center gap-3 min-w-[300px] max-w-md pointer-events-auto`}
                        >
                            <Icon size={20} />
                            <p className="flex-1 font-medium text-sm">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="hover:opacity-70 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
