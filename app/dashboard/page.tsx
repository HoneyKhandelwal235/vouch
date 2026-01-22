"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Wallet, PieChart, Plus, X, Trash2, LogOut, Users, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addExpense, getExpenses, deleteExpense } from './expense-actions';
import { getWorkspaces, createWorkspace, getWorkspaceMembers, addWorkspaceMember } from './workspace-actions';
import { calculateBalances } from './balance-actions';
import { getUser, signOut } from '@/lib/supabase';

interface Expense {
    id: string;
    title: string;
    amount: number;
    created_at: string;
    category: string;
    paid_by: string;
    expense_splits?: Array<{
        user_id: string;
        amount: number;
        profiles?: {
            email: string;
            full_name?: string;
        };
    }>;
    paid_by_profile?: {
        email: string;
        full_name?: string;
    };
}

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
}

interface Workspace {
    id: string;
    name: string;
    description?: string;
    color: string;
    role?: string;
}

interface WorkspaceMember {
    userId: string;
    email: string;
    fullName?: string;
    role: string;
}

interface Balance {
    userId: string;
    email: string;
    fullName?: string;
    balance: number;
}

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'groups'>('expenses');
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
    const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
    const [balances, setBalances] = useState<Balance[]>([]);

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);

    // Expense form
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');
    const [splitWith, setSplitWith] = useState<string[]>([]);

    // Group form
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [memberEmail, setMemberEmail] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedWorkspace && user) {
            loadWorkspaceData();
        }
    }, [selectedWorkspace, user]);

    const loadData = async () => {
        setLoading(true);
        const currentUser = await getUser();
        if (currentUser) {
            setUser({
                id: currentUser.id,
                email: currentUser.email || '',
                full_name: currentUser.user_metadata?.full_name,
            });

            const userWorkspaces = await getWorkspaces(currentUser.id);
            setWorkspaces(userWorkspaces);

            if (userWorkspaces.length > 0 && !selectedWorkspace) {
                setSelectedWorkspace(userWorkspaces[0].id);
            }
        }
        setLoading(false);
    };

    const loadWorkspaceData = async () => {
        if (!selectedWorkspace || !user) return;

        const [expensesData, membersData, balancesData] = await Promise.all([
            getExpenses(selectedWorkspace),
            getWorkspaceMembers(selectedWorkspace),
            calculateBalances(selectedWorkspace, user.id),
        ]);

        setExpenses(expensesData);
        setWorkspaceMembers(membersData);
        setBalances(balancesData);
        setSplitWith([user.id]); // Default to splitting with self
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !user || !selectedWorkspace) return;

        try {
            await addExpense(
                title,
                parseFloat(amount),
                category,
                user.id,
                selectedWorkspace,
                splitWith.length > 0 ? splitWith : [user.id],
                'equal'
            );

            setTitle('');
            setAmount('');
            setCategory('General');
            setSplitWith([user.id]);
            setShowExpenseModal(false);
            await loadWorkspaceData();
        } catch (error) {
            console.error('Failed to add expense:', error);
            alert('Failed to add expense. Please try again.');
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName || !user) return;

        try {
            await createWorkspace(groupName, user.id, groupDescription);
            setGroupName('');
            setGroupDescription('');
            setShowGroupModal(false);
            await loadData();
        } catch (error) {
            console.error('Failed to create group:', error);
            alert('Failed to create group. Please try again.');
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberEmail || !selectedWorkspace) return;

        try {
            await addWorkspaceMember(selectedWorkspace, memberEmail);
            setMemberEmail('');
            setShowAddMemberModal(false);
            await loadWorkspaceData();
        } catch (error: any) {
            alert(error.message || 'Failed to add member');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteExpense(id);
            await loadWorkspaceData();
        } catch (error) {
            console.error('Failed to delete expense:', error);
        }
    };

    const toggleSplitMember = (memberId: string) => {
        setSplitWith(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const totalAmount = expenses.reduce((sum, exp) => exp.amount, 0);
    const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#4F75FF] via-[#7B68EE] to-[#FF6B9D] flex items-center justify-center">
                <div className="text-white text-2xl">Loading...</div>
            </div>
        );
    }

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
                            <h1 className="text-5xl font-black text-white mb-2">Vouch</h1>
                            <p className="text-white/70">Split expenses with friends</p>
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

                {/* Workspace Selector */}
                {workspaces.length > 0 && (
                    <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
                        {workspaces.map((workspace) => (
                            <button
                                key={workspace.id}
                                onClick={() => setSelectedWorkspace(workspace.id)}
                                className={`px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${selectedWorkspace === workspace.id
                                        ? 'bg-white text-[#4F75FF]'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {workspace.name}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowGroupModal(true)}
                            className="px-6 py-3 rounded-2xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all whitespace-nowrap flex items-center gap-2"
                        >
                            <Plus size={20} />
                            New Group
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6 flex gap-3">
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'expenses'
                                ? 'bg-white text-[#4F75FF]'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('balances')}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'balances'
                                ? 'bg-white text-[#4F75FF]'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        Balances
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'groups'
                                ? 'bg-white text-[#4F75FF]'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        Members
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'expenses' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Expenses</h2>
                            <button
                                onClick={() => setShowExpenseModal(true)}
                                className="bg-white hover:bg-white/90 text-[#4F75FF] px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Add Expense
                            </button>
                        </div>

                        {expenses.length === 0 ? (
                            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 text-center">
                                <p className="text-white/60">No expenses yet. Add your first expense!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {expenses.map((expense, index) => (
                                    <motion.div
                                        key={expense.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-1">{expense.title}</h3>
                                                <p className="text-white/60 text-sm mb-2">
                                                    {expense.category} • {new Date(expense.created_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-white/80 text-sm">
                                                    Paid by: {expense.paid_by_profile?.full_name || expense.paid_by_profile?.email || 'Unknown'}
                                                </p>
                                                {expense.expense_splits && expense.expense_splits.length > 0 && (
                                                    <p className="text-white/60 text-xs mt-1">
                                                        Split with {expense.expense_splits.length} {expense.expense_splits.length === 1 ? 'person' : 'people'}
                                                    </p>
                                                )}
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
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'balances' && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Balances</h2>
                        {balances.length === 0 ? (
                            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 text-center">
                                <p className="text-white/60">All settled up! 🎉</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {balances.map((balance) => (
                                    <div
                                        key={balance.userId}
                                        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-bold">{balance.fullName || balance.email}</p>
                                                <p className="text-white/60 text-sm">{balance.email}</p>
                                            </div>
                                            <div className="text-right">
                                                {balance.balance > 0 ? (
                                                    <p className="text-green-300 font-bold text-xl">
                                                        owes you ${balance.balance.toFixed(2)}
                                                    </p>
                                                ) : (
                                                    <p className="text-red-300 font-bold text-xl">
                                                        you owe ${Math.abs(balance.balance).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Members</h2>
                            <button
                                onClick={() => setShowAddMemberModal(true)}
                                className="bg-white hover:bg-white/90 text-[#4F75FF] px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2"
                            >
                                <UserPlus size={20} />
                                Add Member
                            </button>
                        </div>
                        <div className="space-y-4">
                            {workspaceMembers.map((member) => (
                                <div
                                    key={member.userId}
                                    className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-bold">{member.fullName || member.email}</p>
                                            <p className="text-white/60 text-sm">{member.email}</p>
                                        </div>
                                        <span className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold">
                                            {member.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showExpenseModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
                        onClick={() => setShowExpenseModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setShowExpenseModal(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-[#4F75FF] mb-6">Add Expense</h2>

                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount</label>
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
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

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Split with ({splitWith.length} selected)
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {workspaceMembers.map((member) => (
                                            <label
                                                key={member.userId}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={splitWith.includes(member.userId)}
                                                    onChange={() => toggleSplitMember(member.userId)}
                                                    className="w-5 h-5"
                                                />
                                                <span className="text-sm">{member.fullName || member.email}</span>
                                            </label>
                                        ))}
                                    </div>
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

            {/* Create Group Modal */}
            <AnimatePresence>
                {showGroupModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
                        onClick={() => setShowGroupModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setShowGroupModal(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-[#4F75FF] mb-6">Create Group</h2>

                            <form onSubmit={handleCreateGroup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Group Name</label>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="e.g., Roommates, Trip to Goa"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4F75FF] focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        value={groupDescription}
                                        onChange={(e) => setGroupDescription(e.target.value)}
                                        placeholder="What's this group for?"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4F75FF] focus:outline-none"
                                        rows={3}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#4F75FF] hover:bg-[#4060DD] text-white py-4 rounded-2xl font-bold transition-all mt-6"
                                >
                                    Create Group
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Member Modal */}
            <AnimatePresence>
                {showAddMemberModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
                        onClick={() => setShowAddMemberModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setShowAddMemberModal(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-3xl font-black text-[#4F75FF] mb-6">Add Member</h2>

                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        placeholder="friend@example.com"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#4F75FF] focus:outline-none"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        They must have a Vouch account with this email
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#4F75FF] hover:bg-[#4060DD] text-white py-4 rounded-2xl font-bold transition-all mt-6"
                                >
                                    Add Member
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
