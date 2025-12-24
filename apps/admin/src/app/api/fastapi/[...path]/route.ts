import { NextRequest } from 'next/server'
import { proxyToFastApi } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'GET', params, {
    enableRedirectHandling: true, // Admin app needs redirect handling
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'POST', params, {
    strictHeaders: true, // Admin app uses strict header filtering
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'PUT', params, {
    strictHeaders: false, // Admin app PUT allows more headers including User-Agent
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'DELETE', params, {
    strictHeaders: true, // Admin app DELETE uses strict header filtering
  })
}
