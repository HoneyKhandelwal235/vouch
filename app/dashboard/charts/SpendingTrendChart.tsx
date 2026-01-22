"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from '../ui/GlassCard';

interface SpendingData {
    date: string;
    amount: number;
}

interface SpendingTrendChartProps {
    data: SpendingData[];
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
    return (
        <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-zinc-800 mb-4">Spending Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#4F75FF"
                        strokeWidth={3}
                        dot={{ fill: '#4F75FF', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </GlassCard>
    );
}
