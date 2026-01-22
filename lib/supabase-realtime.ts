import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Real-time channel for vouches
export function subscribeToVouches(callback: (payload: any) => void) {
    const channel = supabase
        .channel('vouches-channel')
        .on('broadcast', { event: 'vouch-created' }, callback)
        .subscribe()

    return channel
}

export function broadcastVouchCreated(vouch: any) {
    supabase.channel('vouches-channel').send({
        type: 'broadcast',
        event: 'vouch-created',
        payload: vouch,
    })
}

// Real-time channel for likes
export function subscribeToLikes(callback: (payload: any) => void) {
    const channel = supabase
        .channel('likes-channel')
        .on('broadcast', { event: 'like-toggled' }, callback)
        .subscribe()

    return channel
}

export function broadcastLikeToggled(data: { expenseId: string; likeCount: number; isLiked: boolean }) {
    supabase.channel('likes-channel').send({
        type: 'broadcast',
        event: 'like-toggled',
        payload: data,
    })
}
