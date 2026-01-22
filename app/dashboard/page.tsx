"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Wallet, PieChart, Plus, X, Trash2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addExpense, getExpenses, deleteExpense } from './expense-actions';
import { getUser, signOut } from '@/lib/supabase';

interface Expense {
    id: string;
    title: string;
    amount: number;
    created_at: string;
    category: string;
}

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
}

export default function DashboardPage() {
    const [showModal, setShowModal] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');

    // Load user and expenses on mount
    useEffect(() => {
        loadUserAndExpenses();
    }, []);

    const loadUserAndExpenses = async () => {
        setLoading(true);
        const currentUser = await getUser();
        if (currentUser) {
            setUser({
                id: currentUser.id,
                email: currentUser.email || '',
                full_name: currentUser.user_metadata?.full_name,
            });
        }
        const data = await getExpenses();
        setExpenses(data);
        setLoading(false);
    };

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount) return;

        try {
            if (!user) {
                alert('Please log in to add expenses');
                return;
            }

            await addExpense(title, parseFloat(amount), category, user.id);
            setTitle('');
            setAmount('');
            setCategory('General');
            setShowModal(false);
            await loadUserAndExpenses(); // Reload expenses
        } catch (error) {
            console.error('Failed to add expense:', error);
            alert('Failed to add expense. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteExpense(id);
            await loadUserAndExpenses(); // Reload expenses
        } catch (error) {
            console.error('Failed to delete expense:', error);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#4F75FF] via-[#7B68EE] to-[#FF6B9D] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-5xl font-black text-white mb-2">Dashboard</h1>
                            <p className="text-white/70">Welcome to your finance studio</p>
                        </div>
                        {user && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-white font-bold">{user.full_name || 'User'}</p>
                                    <p className="text-white/60 text-sm">{user.email}</p>
                                </div>
                                <button
                                    onClick={signOut}
                                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-3 rounded-2xl transition-all"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Wallet className="text-white" size={32} />
                            <span className="text-white/60 text-sm">Total</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">${totalAmount.toFixed(2)}</h3>
                        <p className="text-white/60 text-sm">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <TrendingUp className="text-white" size={32} />
                            <span className="text-white/60 text-sm">This Month</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">${totalAmount.toFixed(2)}</h3>
                        <p className="text-white/60 text-sm">Stored in database</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <PieChart className="text-white" size={32} />
                            <span className="text-white/60 text-sm">Categories</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{new Set(expenses.map(e => e.category)).size}</h3>
                        <p className="text-white/60 text-sm">Unique categories</p>
                    </motion.div>
                </div>

                {/* Expenses List or Empty State */}
                {loading ? (
                    <div className="text-center text-white py-12">Loading...</div>
                ) : expenses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 text-center"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Plus className="text-white" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">
                                Ready to start tracking?
                            </h2>
                            <p className="text-white/60 mb-6">
                                Add your first expense to get started. It will be saved to the database!
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-white hover:bg-white/90 text-[#4F75FF] px-8 py-4 rounded-2xl font-bold transition-all"
                            >
                                Add Expense
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Recent Expenses</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-white hover:bg-white/90 text-[#4F75FF] px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Add Expense
                            </button>
                        </div>
                        <div className="space-y-4">
                            {expenses.map((expense, index) => (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 flex justify-between items-center group"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{expense.title}</h3>
                                        <p className="text-white/60 text-sm">
                                            {expense.category} • {new Date(expense.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-2xl font-bold text-white">${expense.amount.toFixed(2)}</p>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-red-400"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-[#4F75FF] mb-6">Add Expense</h2>

                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Groceries"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4F75FF] focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4F75FF] focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4F75FF] focus:outline-none"
                                    >
                                        <option>General</option>
                                        <option>Food</option>
                                        <option>Transport</option>
                                        <option>Entertainment</option>
                                        <option>Shopping</option>
                                        <option>Bills</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#4F75FF] hover:bg-[#4060DD] text-white py-4 rounded-2xl font-bold transition-all mt-6"
                                >
                                    Add Expense
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
