import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { redisSessionStore, redisCache } from './redis'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}

// Mock user database - replace with your actual database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: '$2a$12$JgUa2JoxP20VmXCquu9zdOnSRDR.5x3TPIf0zhAM7tT2HfTwhII2q', // "admin123"
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: '$2a$12$JgUa2JoxP20VmXCquu9zdOnSRDR.5x3TPIf0zhAM7tT2HfTwhII2q', // "admin123"
    name: 'Regular User',
    role: 'user',
  },
]

/**
 * Get user by email with Redis caching (with timeout)
 */
async function getUserByEmail(email: string) {
  try {
    // Try to get from cache first (with 2 second timeout)
    const cacheKey = `user:${email}`
    const cachedUser = await Promise.race([
      redisCache.get(cacheKey),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Cache timeout')), 2000))
    ]).catch(() => null)
    
    if (cachedUser) {
      console.log('User found in cache:', email)
      return cachedUser
    }
  } catch (error) {
    console.warn('Redis cache error, continuing without cache:', error)
  }
  
  // If not in cache, get from database
  const user = users.find(user => user.email === email)
  
  if (user) {
    // Try to cache user data for 5 minutes (non-blocking)
    try {
      redisCache.set(cacheKey, user, 300).catch(err => {
        console.warn('Failed to cache user:', err)
      })
    } catch (error) {
      console.warn('Redis cache set error, continuing:', error)
    }
  }
  
  return user
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider - only register if credentials are provided
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        httpOptions: {
          timeout: 20000, // 20 seconds timeout
        },
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : []),
    
    // GitHub OAuth Provider - only register if credentials are provided
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        httpOptions: {
          timeout: 20000, // 20 seconds timeout
        },
      })
    ] : []),
    
    // Credentials Provider (Email/Password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getUserByEmail(credentials.email)
        
        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isPasswordValid) {
          return null
        }

        // Log successful login to Redis (non-blocking)
        const loginKey = `login:${user.id}:${Date.now()}`
        redisCache.set(loginKey, {
          userId: user.id,
          email: user.email,
          timestamp: new Date().toISOString(),
          ip: 'unknown' // You can get this from request headers
        }, 86400).catch(err => {
          console.warn('Failed to log login to Redis:', err)
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        
        // Store session data in Redis (non-blocking, with timeout)
        const sessionKey = `jwt:${token.sub}`
        try {
          await Promise.race([
            redisSessionStore.set(sessionKey, {
              userId: user.id,
              email: user.email,
              role: user.role,
              lastAccess: new Date().toISOString()
            }, 30 * 24 * 60 * 60),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 3000))
          ])
        } catch (error) {
          console.warn('Failed to store session in Redis:', error)
          // Continue anyway, session will still work with JWT
        }
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ''
        session.user.role = token.role || 'user'
        
        // Update last access time in Redis (non-blocking)
        const sessionKey = `jwt:${token.sub}`
        try {
          const sessionData = await Promise.race([
            redisSessionStore.get(sessionKey),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 2000))
          ]).catch(() => null)
          
          if (sessionData) {
            sessionData.lastAccess = new Date().toISOString()
            redisSessionStore.set(sessionKey, sessionData, 30 * 24 * 60 * 60).catch(err => {
              console.warn('Failed to update session in Redis:', err)
            })
          }
        } catch (error) {
          console.warn('Failed to access session in Redis:', error)
          // Continue anyway, session will still work
        }
      }
      return session
    },
    
    async signOut({ token }) {
      // Clean up session data from Redis on sign out (non-blocking)
      if (token?.sub) {
        const sessionKey = `jwt:${token.sub}`
        redisSessionStore.delete(sessionKey).catch(err => {
          console.warn('Failed to clean up session in Redis:', err)
        })
      }
    }
  },
  
  events: {
    async signIn({ user, account, profile }) {
      // Log sign-in events to Redis (non-blocking)
      const eventKey = `event:signin:${user.id}:${Date.now()}`
      redisCache.set(eventKey, {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        timestamp: new Date().toISOString()
      }, 86400).catch(err => {
        console.warn('Failed to log sign-in event:', err)
      })
    },
    
    async signOut({ token }) {
      // Log sign-out events to Redis (non-blocking)
      if (token?.sub) {
        const eventKey = `event:signout:${token.sub}:${Date.now()}`
        redisCache.set(eventKey, {
          userId: token.sub,
          timestamp: new Date().toISOString()
        }, 86400).catch(err => {
          console.warn('Failed to log sign-out event:', err)
        })
      }
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  // Add debug mode for development
  debug: process.env.NODE_ENV === 'development',
}