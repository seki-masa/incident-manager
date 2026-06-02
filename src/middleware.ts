import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// シンプルなインメモリレート制限（1分間に100リクエスト/IP）
// ※ サーバーレス環境ではインスタンスをまたいだカウントにはならないが基本的な保護として機能する
const WINDOW_MS = 60_000
const MAX_REQUESTS = 100
const ipCounts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  entry.count++
  return entry.count <= MAX_REQUESTS
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 静的ファイルはスキップ
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // レート制限
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // NextAuth の認証エンドポイントとログインページはスキップ
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // 認証チェック
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
