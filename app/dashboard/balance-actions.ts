'use server'
import { supabase } from '@/lib/supabase'

interface Balance {
    userId: string
    email: string
    fullName?: string
    balance: number // Positive = they owe you, Negative = you owe them
}

export async function calculateBalances(workspaceId: string, currentUserId: string): Promise<Balance[]> {
    try {
        // Get all expenses for this workspace
        const { data: expenses, error: expensesError } = await supabase
            .from('expenses')
            .select(`
        id,
        amount,
        paid_by,
        expense_splits (
          user_id,
          amount
        )
      `)
            .eq('workspace_id', workspaceId)

        if (expensesError) {
            console.error('Error fetching expenses:', expensesError)
            return []
        }

        // Calculate net balances
        const balanceMap = new Map<string, number>()

        for (const expense of expenses || []) {
            const paidBy = expense.paid_by

            for (const split of expense.expense_splits || []) {
                const userId = split.user_id
                const owedAmount = split.amount

                // If current user paid
                if (paidBy === currentUserId && userId !== currentUserId) {
                    // Others owe current user
                    const current = balanceMap.get(userId) || 0
                    balanceMap.set(userId, current + owedAmount)
                }
                // If someone else paid and current user owes
                else if (paidBy !== currentUserId && userId === currentUserId) {
                    // Current user owes the payer
                    const current = balanceMap.get(paidBy) || 0
                    balanceMap.set(paidBy, current - owedAmount)
                }
            }
        }

        // Get user details for all involved users
        const userIds = Array.from(balanceMap.keys())
        if (userIds.length === 0) return []

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', userIds)

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
            return []
        }

        // Build balance array
        const balances: Balance[] = []
        for (const [userId, balance] of balanceMap.entries()) {
            const profile = profiles?.find(p => p.id === userId)
            if (profile && Math.abs(balance) > 0.01) { // Ignore tiny balances
                balances.push({
                    userId,
                    email: profile.email || '',
                    fullName: profile.full_name,
                    balance,
                })
            }
        }

        return balances.sort((a, b) => b.balance - a.balance)
    } catch (error) {
        console.error('Error calculating balances:', error)
        return []
    }
}

export async function settleUp(workspaceId: string, fromUserId: string, toUserId: string, amount: number) {
    try {
        // Create a settlement expense (amount paid back)
        const { error } = await supabase
            .from('expenses')
            .insert([
                {
                    title: 'Settlement',
                    amount: amount,
                    category: 'Settlement',
                    user_id: fromUserId,
                    paid_by: fromUserId,
                    workspace_id: workspaceId,
                    created_at: new Date().toISOString(),
                }
            ])

        if (error) {
            console.error('Error creating settlement:', error)
            throw new Error('Failed to settle up')
        }

        // Note: In a real app, you might want a separate settlements table
        // For now, we'll just let the balance calculation handle it

    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}
