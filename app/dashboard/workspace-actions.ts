'use server'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getWorkspaces(userId: string) {
    try {
        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
        workspace_id,
        role,
        workspaces (
          id,
          name,
          description,
          color,
          created_by,
          created_at
        )
      `)
            .eq('user_id', userId)

        if (error) {
            console.error('Error fetching workspaces:', error)
            return []
        }

        return data?.map(item => ({
            ...item.workspaces,
            role: item.role
        })).filter(Boolean) || []
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

        // Add creator as owner
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

export async function getWorkspaceMembers(workspaceId: string) {
    try {
        const { data, error } = await supabase
            .from('workspace_members')
            .select(`
        user_id,
        role,
        joined_at,
        profiles (
          id,
          email,
          full_name
        )
      `)
            .eq('workspace_id', workspaceId)

        if (error) {
            console.error('Error fetching members:', error)
            return []
        }

        return data?.map(item => ({
            userId: item.user_id,
            role: item.role,
            joinedAt: item.joined_at,
            email: item.profiles?.email,
            fullName: item.profiles?.full_name,
        })) || []
    } catch (error) {
        console.error('Error:', error)
        return []
    }
}

export async function addWorkspaceMember(workspaceId: string, email: string) {
    try {
        // Find user by email
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (profileError || !profile) {
            throw new Error('User not found with that email')
        }

        // Add to workspace
        const { error } = await supabase
            .from('workspace_members')
            .insert([
                {
                    workspace_id: workspaceId,
                    user_id: profile.id,
                    role: 'member',
                }
            ])

        if (error) {
            if (error.code === '23505') {
                throw new Error('User is already a member')
            }
            throw new Error('Failed to add member')
        }

        revalidatePath('/dashboard')
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}
