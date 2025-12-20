import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check for session cookie
    const sessionToken = request.cookies.get('admin-session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }

    // In a real app, you'd validate the session token against your database/Redis
    // For now, we'll just check if it exists and has the right format
    if (sessionToken.startsWith('session_')) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        }
      })
    }

    return NextResponse.json({
      authenticated: false,
      user: null
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Session check failed'
    })
  }
}