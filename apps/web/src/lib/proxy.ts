/**
 * FastAPI Proxy for Web App
 * Uses the shared @interview/api-client package
 */

import { NextRequest, NextResponse } from 'next/server'
import { fastApiClient, buildFastApiUrl, buildHeaders, createProxyResponse } from '@interview/api-client'

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
    const headers = buildHeaders({ headers: Object.fromEntries(request.headers.entries()) }, strictHeaders)

    let response: any

    // 根据HTTP方法调用相应的客户端方法
    switch (method.toUpperCase()) {
      case 'GET':
        response = await fastApiClient.get(params.path, {
          headers,
          query: includeQueryParams ? Object.fromEntries(new URL(request.url).searchParams) : undefined,
        })
        break
      case 'POST':
        const postBody = await request.text()
        response = await fastApiClient.post(params.path, postBody, { headers })
        break
      case 'PUT':
        const putBody = await request.text()
        response = await fastApiClient.put(params.path, putBody, { headers })
        break
      case 'DELETE':
        response = await fastApiClient.delete(params.path, { headers })
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
