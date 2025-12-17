import { NextRequest, NextResponse } from 'next/server'
import passport from '@/lib/passport'

export async function GET(request: NextRequest): Promise<Response> {
  try {
    return new Promise<Response>((resolve) => {
      passport.authenticate('github', {
        scope: ['user:email']
      })(request as any, {
        redirect: (url: string) => {
          resolve(NextResponse.redirect(url))
        }
      } as any, () => {
        resolve(NextResponse.json({ error: 'Authentication failed' }, { status: 500 }))
      })
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    )
  }
}