import { NextRequest, NextResponse } from 'next/server'
import { fastApiConfig } from '@interview/config'

// Use centralized FastAPI configuration
const FASTAPI_BASE_URL = fastApiConfig.baseUrl

export async function GET(
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
    const url = `${FASTAPI_BASE_URL}/${path}${request.nextUrl.search}`


    const authHeader = request.headers.get('authorization')

    // 只转发必要的头，避免外部API敏感的头
    const headers: Record<string, string> = {}

    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    // 移除可能导致问题的头，如 Host, Origin 等

    const response = await fetch(url, { headers })

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
    console.error('Web App - Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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


    const body = await request.text()

    const response = await fetch(url, {
      method: 'POST',
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
    console.error('Web App - Proxy error:', error)
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
    console.error('Web App - Proxy error:', error)
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
    console.error('Web App - Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
