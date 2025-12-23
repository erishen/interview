import { NextRequest, NextResponse } from 'next/server'
import { fastApiConfig } from '@interview/config'

// Use centralized FastAPI configuration
const FASTAPI_BASE_URL = fastApiConfig.baseUrl

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 过滤掉空字符串路径段，正确构造API路径
    const filteredPath = params.path.filter(segment => segment.length > 0)
    const path = filteredPath.length > 0 ? filteredPath.join('/') + '/' : ''
    const url = `${FASTAPI_BASE_URL}/${path}`

    // 复制所有相关的请求头
    const headers: Record<string, string> = {}

    // 必须的认证头
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Content-Type
    const contentType = request.headers.get('content-type')
    if (contentType) {
      headers['Content-Type'] = contentType
    }

    // User-Agent (有些API需要)
    const userAgent = request.headers.get('user-agent')
    if (userAgent) {
      headers['User-Agent'] = userAgent
    }


    let response = await fetch(url, {
      method: 'GET',
      headers,
      redirect: 'manual', // 手动处理重定向
    })

    // 如果是重定向，手动跟随并保持认证头
    if (response.status === 307 || response.status === 302) {
      const location = response.headers.get('location')
      console.log('Redirect status:', response.status)
      console.log('Location header:', location)
      if (location) {
        // 处理重定向URL，确保使用正确的协议
        let redirectUrl: string
        if (location.startsWith('http')) {
          // 绝对URL，但可能需要修正协议
          redirectUrl = location.replace('http://', 'https://')
          } else {
          // 相对URL
          redirectUrl = `${FASTAPI_BASE_URL}${location}`
        }

        response = await fetch(redirectUrl, {
          method: 'GET',
          headers,
        })
      }
    }

    const data = await response.text()

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    })
  } catch (error) {
    console.error('GET proxy error:', error)
    return new Response(JSON.stringify({ error: 'Proxy failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filteredPath = params.path.filter(segment => segment.length > 0)
    // Special handling for endpoints that don't need trailing slash
    const isAuthEndpoint = filteredPath[0] === 'auth'
    const isRedisEndpoint = filteredPath[0] === 'redis'
    // Routes with parameters (like /items/123) don't need trailing slash
    const hasParameters = filteredPath.length > 1 && /^\d+$/.test(filteredPath[1])
    const needsTrailingSlash = !isAuthEndpoint && !isRedisEndpoint && !hasParameters

    const path = filteredPath.length > 0
      ? filteredPath.join('/') + (needsTrailingSlash ? '/' : '')
      : ''
    const url = `${FASTAPI_BASE_URL}/${path}`


    const authHeader = request.headers.get('authorization')
    const contentType = request.headers.get('content-type')
    const body = await request.text()

    // 只转发必要的头，避免外部API敏感的头
    const headers: Record<string, string> = {}

    if (contentType) {
      headers['Content-Type'] = contentType
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    // 移除可能导致问题的头，如 Host, Origin 等

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filteredPath = params.path.filter(segment => segment.length > 0)
    // Special handling for endpoints that don't need trailing slash
    const isAuthEndpoint = filteredPath[0] === 'auth'
    const isRedisEndpoint = filteredPath[0] === 'redis'
    // Routes with parameters (like /items/123) don't need trailing slash
    const hasParameters = filteredPath.length > 1 && /^\d+$/.test(filteredPath[1])
    const needsTrailingSlash = !isAuthEndpoint && !isRedisEndpoint && !hasParameters

    const path = filteredPath.length > 0
      ? filteredPath.join('/') + (needsTrailingSlash ? '/' : '')
      : ''
    const url = `${FASTAPI_BASE_URL}/${path}`


    const body = await request.text()

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'Authorization': request.headers.get('authorization') || '',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body,
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filteredPath = params.path.filter(segment => segment.length > 0)
    // Special handling for endpoints that don't need trailing slash
    const isAuthEndpoint = filteredPath[0] === 'auth'
    const isRedisEndpoint = filteredPath[0] === 'redis'
    // Routes with parameters (like /items/123) don't need trailing slash
    const hasParameters = filteredPath.length > 1 && /^\d+$/.test(filteredPath[1])
    const needsTrailingSlash = !isAuthEndpoint && !isRedisEndpoint && !hasParameters

    const path = filteredPath.length > 0
      ? filteredPath.join('/') + (needsTrailingSlash ? '/' : '')
      : ''
    const url = `${FASTAPI_BASE_URL}/${path}`


    const authHeader = request.headers.get('authorization')

    // 只转发必要的头，避免外部API敏感的头
    const headers: Record<string, string> = {}

    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    // 移除可能导致问题的头，如 Host, Origin 等

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    })

    const data = await response.text()

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
