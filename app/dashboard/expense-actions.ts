'use server'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getExpenses(workspaceId?: string) {
    try {
        let query = supabase
            .from('expenses')
            .select(`
        *,
        expense_splits (
          id,
          user_id,
          amount,
          profiles (
            email,
            full_name
          )
        ),
        paid_by_profile:profiles!expenses_paid_by_fkey (
          email,
          full_name
        )
      `)
            .order('created_at', { ascending: false })

        if (workspaceId) {
            query = query.eq('workspace_id', workspaceId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching expenses:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error:', error)
        return []
    }
}

export async function addExpense(
    title: string,
    amount: number,
    category: string,
    userId: string,
    workspaceId: string,
    splitWith: string[], // Array of user IDs to split with
    splitType: 'equal' | 'unequal' = 'equal',
    customAmounts?: Record<string, number> // For unequal splits
) {
    try {
        // Create expense
        const { data: expense, error: expenseError } = await supabase
            .from('expenses')
            .insert([
                {
                    title,
                    amount,
                    category,
                    user_id: userId,
                    paid_by: userId,
                    workspace_id: workspaceId,
                    created_at: new Date().toISOString(),
                }
            ])
            .select()
            .single()

        if (expenseError) {
            console.error('Error adding expense:', expenseError)
            throw new Error('Failed to add expense')
        }

        // Create splits
        const splits = []

        if (splitType === 'equal') {
            const splitAmount = amount / splitWith.length
            for (const splitUserId of splitWith) {
                splits.push({
                    expense_id: expense.id,
                    user_id: splitUserId,
                    amount: splitAmount,
                })
            }
        } else if (splitType === 'unequal' && customAmounts) {
            for (const splitUserId of splitWith) {
                splits.push({
                    expense_id: expense.id,
                    user_id: splitUserId,
                    amount: customAmounts[splitUserId] || 0,
                })
            }
        }

        const { error: splitsError } = await supabase
            .from('expense_splits')
            .insert(splits)

        if (splitsError) {
            console.error('Error creating splits:', splitsError)
            throw new Error('Failed to create expense splits')
        }

        revalidatePath('/dashboard')
        return expense
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export async function deleteExpense(id: string) {
    try {
        // Delete splits first (foreign key constraint)
        await supabase
            .from('expense_splits')
            .delete()
            .eq('expense_id', id)

        // Delete expense
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting expense:', error)
            throw new Error('Failed to delete expense')
        }

        revalidatePath('/dashboard')
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}
