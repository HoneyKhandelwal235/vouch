"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import GlassCard from '../ui/GlassCard';

interface CategoryData {
    name: string;
    value: number;
}

interface CategoryBreakdownProps {
    data: CategoryData[];
}

const COLORS = ['#4F75FF', '#7B68EE', '#FF6B9D', '#10B981', '#F59E0B', '#EF4444'];

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
    return (
        <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-zinc-800 mb-4">Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </GlassCard>
    );
}
