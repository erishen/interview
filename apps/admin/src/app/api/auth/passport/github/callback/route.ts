import { NextRequest, NextResponse } from 'next/server'
import passport from '@/lib/passport'

// Mark this route as dynamic since it uses request.url
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<Response> {
  try {
    return new Promise<Response>((resolve) => {
      passport.authenticate('github', {
        failureRedirect: '/auth/signin?error=github_auth_failed'
      })(request as any, {
        redirect: (url: string) => {
          // On successful authentication, redirect to dashboard
          resolve(NextResponse.redirect(new URL('/dashboard', request.url)))
        }
      } as any, (err: any) => {
        if (err) {
          resolve(NextResponse.redirect(new URL('/auth/signin?error=github_auth_failed', request.url)))
        } else {
          resolve(NextResponse.redirect(new URL('/dashboard', request.url)))
        }
      })
    })
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/signin?error=github_auth_failed', request.url))
  }
}