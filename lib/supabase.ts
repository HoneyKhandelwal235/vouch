import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lzkyjdejdunjrlilnres.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helpers
export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

export async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
}

export async function signInWithEmail(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
    return await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            }
        }
    })
}

export async function signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
    })
}

export async function signInWithGithub() {
    return await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
    })
}
