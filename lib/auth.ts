// Simplified auth - no database required
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
    providers: [],
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
}
