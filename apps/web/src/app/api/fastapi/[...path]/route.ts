import { NextRequest } from 'next/server'
import { proxyToFastApi } from '@/lib/proxy'

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'GET', params, {
    includeQueryParams: true, // Web app includes query parameters
    enableRedirectHandling: false, // Web app doesn't need redirect handling
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'POST', params)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'PUT', params)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'DELETE', params, {
    strictHeaders: true, // Web app DELETE uses strict header filtering
  })
}
