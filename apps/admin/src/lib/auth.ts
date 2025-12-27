import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { redisCache } from './redis'

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

// Internal user type with password
interface InternalUser {
  id: string
  email: string
  name: string
  role: string
  password: string
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}

// User database configuration
interface ConfigUser {
  id: string
  email: string
  password: string
  name: string
  role: string
}

// 从环境变量获取用户配置
const getUsersFromEnv = (): ConfigUser[] => {
  const users: ConfigUser[] = []

  // 修复 bcrypt hash - dotenv 可能将 $ 符号当作变量引用截断了
  // 使用 Base64 编码存储来避免这个问题
  let adminPasswordHash = ''

  if (process.env.NEXTAUTH_ADMIN_PASSWORD_HASH_BASE64) {
    try {
      adminPasswordHash = Buffer.from(process.env.NEXTAUTH_ADMIN_PASSWORD_HASH_BASE64, 'base64').toString('utf-8')
    } catch (err) {
      console.error('[Auth] Failed to decode BASE64 hash:', err)
    }
  } else if (process.env.NEXTAUTH_ADMIN_PASSWORD_HASH) {
    adminPasswordHash = process.env.NEXTAUTH_ADMIN_PASSWORD_HASH
  }

  // 检测 hash 是否有效（$2a$ 或 $2b$ 开头）
  if (adminPasswordHash && !adminPasswordHash.startsWith('$2a$') && !adminPasswordHash.startsWith('$2b$')) {
    console.warn('⚠️  [Auth] NEXTAUTH_ADMIN_PASSWORD_HASH 无效（缺少 $2a$ 或 $2b$ 前缀）')
    console.warn(`   当前值: ${adminPasswordHash}`)
  }

  // Admin user
  if (process.env.ADMIN_EMAIL && (adminPasswordHash || process.env.NEXTAUTH_ADMIN_PASSWORD)) {
    users.push({
      id: '1',
      email: process.env.ADMIN_EMAIL,
      password: adminPasswordHash || process.env.NEXTAUTH_ADMIN_PASSWORD || '',
      name: 'Admin User',
      role: 'admin',
    })
  }

  // Regular user (可选）
  if (process.env.USER_EMAIL && (process.env.USER_PASSWORD_HASH || process.env.USER_PASSWORD)) {
    users.push({
      id: '2',
      email: process.env.USER_EMAIL,
      password: process.env.USER_PASSWORD_HASH || process.env.USER_PASSWORD || '',
      name: 'Regular User',
      role: 'user',
    })
  }

  // 如果没有配置环境变量，使用默认测试用户（仅开发环境）
  const hasAdminUser = users.some(u => u.role === 'admin')
  if (!hasAdminUser && process.env.NODE_ENV !== 'production') {
    users.push(
      {
        id: '1',
        email: 'admin@example.com',
        password: '$2a$12$JgUa2JoxP20VmXCquu9zdOnSRDR.5x3TPIf0zhAM7tT2HfTwhII2q', // "admin123"
        name: 'Admin User',
        role: 'admin',
      }
    )
  }

  if (users.length === 0 && process.env.NODE_ENV !== 'production') {
    users.push({
      id: '2',
      email: 'user@example.com',
      password: '$2a$12$JgUa2JoxP20VmXCquu9zdOnSRDR.5x3TPIf0zhAM7tT2HfTwhII2q', // "admin123"
      name: 'Regular User',
      role: 'user',
    })
  }

  return users
}

const users = getUsersFromEnv()

/**
 * Get user by email (without Redis caching for debugging)
 */
async function getUserByEmail(email: string): Promise<InternalUser | null> {
  // 直接从内存数组获取用户，不使用 Redis 缓存
  const user = users.find(user => user.email === email)
  return user || null
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
        // 用户首次登录，设置所有信息
        token.role = user.role || 'user'
        token.sub = user.id
        token.email = user.email
      } else if (token.email && !token.role) {
        // 对于 OAuth 用户，如果 role 还没有设置，根据 email 判断
        const adminEmails = process.env.NEXTAUTH_ADMIN_EMAILS?.split(',').map(e => e.trim()) || ['admin@example.com']
        token.role = adminEmails.includes(token.email) ? 'admin' : 'user'

        // 如果没有 id，从 email 生成一个
        if (!token.sub) {
          token.sub = Buffer.from(token.email).toString('base64')
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || ''
        session.user.role = token.role || 'user'
        if (token.email) {
          session.user.email = token.email
        }
      }
      return session
    }
  },

  events: {
    async signIn({ user, account }) {
      // For OAuth providers, set id and role
      if (account?.provider === 'google' || account?.provider === 'github') {
        const adminEmails = process.env.NEXTAUTH_ADMIN_EMAILS?.split(',').map(e => e.trim()) || ['admin@example.com']

        // Set role based on email
        user.role = adminEmails.includes(user.email || '') ? 'admin' : 'user'

        // Generate a consistent ID for OAuth users
        if (!user.id && user.email) {
          user.id = Buffer.from(user.email).toString('base64')
        }
      }

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

  // Disable debug mode to avoid 401 errors in console
  debug: false,

  // Custom logger to filter out expected 401 errors
  logger: {
    error(code, metadata) {
      // Ignore client fetch errors for session (normal when not logged in)
      if (code === 'CLIENT_FETCH_ERROR') return
      console.error(`[next-auth][error][${code}]`, metadata)
    },
    warn(code) {
      console.warn(`[next-auth][warn][${code}]`)
    },
    debug(code, metadata) {
      console.log(`[next-auth][debug][${code}]`, metadata)
    }
  }
}