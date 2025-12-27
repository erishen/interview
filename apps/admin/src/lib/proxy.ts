/**
 * FastAPI Proxy for Admin App
 * Uses the shared @interview/api-client package
 */

import { NextRequest, NextResponse } from 'next/server'
import { fastApiClient, buildHeaders, createProxyResponse } from '@interview/api-client'

export interface ProxyOptions {
  includeQueryParams?: boolean
  enableRedirectHandling?: boolean
  strictHeaders?: boolean
}


/**
 * 通用的 FastAPI 代理函数
 */
export async function proxyToFastApi(
  request: NextRequest,
  method: string,
  params: { path: string[] },
  options: ProxyOptions = {}
): Promise<NextResponse> {
  const { includeQueryParams = false, enableRedirectHandling = false, strictHeaders = false } = options

  try {
    // 对于 admin 应用，使用重定向处理
    const ApiClient = await import('@interview/api-client')
    const client = enableRedirectHandling
      ? new ApiClient.FastApiClient({ enableRedirectHandling: true })
      : fastApiClient

    // 从 NextRequest 中提取所有 cookies 并转发给 FastAPI
    const cookieString = request.headers.get('cookie') || ''
    if (cookieString) {
      client.setCookieString(cookieString)
    }

    // 从环境变量读取 DOC_LOG_API_KEY 并添加到请求头
    const headers: Record<string, string> = {}
    for (const [key, value] of request.headers.entries()) {
      headers[key] = value
    }

    // 只有当请求头中没有 X-API-Key 时才添加（避免重复）
    if (process.env.DOC_LOG_API_KEY && !headers['X-API-Key'] && !headers['x-api-key']) {
      headers['X-API-Key'] = process.env.DOC_LOG_API_KEY
    }

    const proxyHeaders = buildHeaders({ headers }, strictHeaders)

    let response: any

    // 根据HTTP方法调用相应的客户端方法
    switch (method.toUpperCase()) {
      case 'GET':
        response = await client.get(params.path, {
          headers: proxyHeaders,
          query: includeQueryParams ? Object.fromEntries(new URL(request.url).searchParams) : undefined,
        })
        break
      case 'POST':
        const postBody = await request.text()
        response = await client.post(params.path, postBody, { headers: proxyHeaders })
        break
      case 'PUT':
        const putBody = await request.text()
        response = await client.put(params.path, putBody, { headers: proxyHeaders })
        break
      case 'DELETE':
        response = await client.delete(params.path, { headers: proxyHeaders })
        break
      default:
        throw new Error(`Unsupported HTTP method: ${method}`)
    }

    return createProxyResponse(response)
  } catch (error) {
    console.error(`Proxy ${method} error:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
