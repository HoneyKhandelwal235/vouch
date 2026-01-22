'use server'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getExpenses(workspaceId?: string) {
    try {
        let query = supabase
            .from('expenses')
            .select('*')
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

export async function addExpense(title: string, amount: number, category: string, userId: string, workspaceId?: string) {
    try {
        const { data, error } = await supabase
            .from('expenses')
            .insert([
                {
                    title,
                    amount,
                    category,
                    user_id: userId,
                    paid_by: userId,
                    workspace_id: workspaceId || null,
                    created_at: new Date().toISOString(),
                }
            ])
            .select()

        if (error) {
            console.error('Error adding expense:', error)
            throw new Error('Failed to add expense')
        }

        revalidatePath('/dashboard')
        return data
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}

export async function deleteExpense(id: string) {
    try {
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

// Workspace actions
export async function getWorkspaces(userId: string) {
    try {
        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
        workspace_id,
        workspaces (
          id,
          name,
          description,
          color,
          created_by
        )
      `)
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching workspaces:', error)
            return []
        }

        return data?.map(item => item.workspaces).filter(Boolean) || []
    } catch (error) {
        console.error('Error:', error)
        return []
    }
}

export async function createWorkspace(name: string, userId: string, description?: string, color?: string) {
    try {
        const { data: workspace, error: workspaceError } = await supabase
            .from('workspaces')
            .insert([
                {
                    name,
                    description,
                    color: color || '#4F75FF',
                    created_by: userId,
                }
            ])
            .select()
            .single()

        if (workspaceError) {
            console.error('Error creating workspace:', workspaceError)
            throw new Error('Failed to create workspace')
        }

        // Add creator as member
        const { error: memberError } = await supabase
            .from('workspace_members')
            .insert([
                {
                    workspace_id: workspace.id,
                    user_id: userId,
                    role: 'owner',
                }
            ])

        if (memberError) {
            console.error('Error adding member:', memberError)
            throw new Error('Failed to add workspace member')
        }

        revalidatePath('/dashboard')
        return workspace
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}
