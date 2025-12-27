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
    enableRedirectHandling: true, // Enable redirect handling for POST requests
    strictHeaders: false, // POST needs X-API-Key for doc logging
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'PUT', params, {
    enableRedirectHandling: true, // Enable redirect handling for PUT requests
    strictHeaders: false, // Admin app PUT allows more headers including User-Agent
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyToFastApi(request, 'DELETE', params, {
    enableRedirectHandling: true, // Enable redirect handling for DELETE requests
    strictHeaders: true, // Admin app DELETE uses strict header filtering
  })
}
