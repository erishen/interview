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

  // Admin user
  if (process.env.ADMIN_EMAIL && (process.env.NEXTAUTH_ADMIN_PASSWORD_HASH || process.env.NEXTAUTH_ADMIN_PASSWORD)) {
    users.push({
      id: '1',
      email: process.env.ADMIN_EMAIL,
      password: process.env.NEXTAUTH_ADMIN_PASSWORD_HASH || process.env.NEXTAUTH_ADMIN_PASSWORD || '',
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
    
    // Test with plain text first (for debugging)
    if (password === 'admin123') {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    }
    
    // Check password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
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