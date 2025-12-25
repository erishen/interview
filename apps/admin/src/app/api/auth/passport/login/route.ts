import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

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

  // Admin user - 支持 BASE64 编码的密码 hash
  let adminPasswordHash = ''

  if (process.env.NEXTAUTH_ADMIN_PASSWORD_HASH_BASE64) {
    try {
      adminPasswordHash = Buffer.from(process.env.NEXTAUTH_ADMIN_PASSWORD_HASH_BASE64, 'base64').toString('utf-8')
      console.log('[Passport Login] Decoded bcrypt hash from BASE64')
    } catch (err) {
      console.error('[Passport Login] Failed to decode BASE64 hash:', err)
    }
  } else if (process.env.NEXTAUTH_ADMIN_PASSWORD_HASH) {
    adminPasswordHash = process.env.NEXTAUTH_ADMIN_PASSWORD_HASH
  }

  console.log('[Passport Login] Checking admin user from env:', {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    NEXTAUTH_ADMIN_PASSWORD_HASH: adminPasswordHash ? adminPasswordHash.substring(0, 20) + '...' : 'not set',
    NEXTAUTH_ADMIN_PASSWORD: process.env.NEXTAUTH_ADMIN_PASSWORD ? '***' : 'not set',
  })

  if (process.env.ADMIN_EMAIL && (adminPasswordHash || process.env.NEXTAUTH_ADMIN_PASSWORD)) {
    users.push({
      id: '1',
      email: process.env.ADMIN_EMAIL,
      password: adminPasswordHash || process.env.NEXTAUTH_ADMIN_PASSWORD || '',
      name: 'Admin User',
      role: 'admin',
    })
    console.log('[Passport Login] Admin user added from env')
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
  if (users.length === 0 && process.env.NODE_ENV !== 'production') {
    users.push(
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
      }
    )
    console.warn('⚠️  使用默认测试用户，生产环境请设置环境变量！')
  }

  console.log('[Passport Login] Final users array:', users.map(u => ({ email: u.email, password: u.password.substring(0, 20) + '...' })))

  return users
}

const users = getUsersFromEnv()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('[Passport Login] Password validation failed for user:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}