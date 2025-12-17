import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Remove the authOptions export as it's not a valid Route export
// If you need to access authOptions elsewhere, create a separate config file