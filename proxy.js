import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    if (pathname.startsWith('/dashboard/supervisor') && role !== 'SUPERVISOR') {
      const fallback = role ? role.toLowerCase() : 'login'
      return NextResponse.redirect(new URL(fallback === 'login' ? '/login' : `/dashboard/${fallback}`, req.url))
    }

    if (pathname.startsWith('/dashboard/manager') && !['MANAGER', 'SUPERVISOR'].includes(role)) {
      const fallback = role ? role.toLowerCase() : 'login'
      return NextResponse.redirect(new URL(fallback === 'login' ? '/login' : `/dashboard/${fallback}`, req.url))
    }

    if (pathname.startsWith('/dashboard/executor') && !['EXECUTOR', 'SUPERVISOR', 'MANAGER'].includes(role)) {
      const fallback = role ? role.toLowerCase() : 'login'
      return NextResponse.redirect(new URL(fallback === 'login' ? '/login' : `/dashboard/${fallback}`, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    secret: process.env.NEXTAUTH_SECRET || "tms-secret-2024-abc123xyz",
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/templates/:path*",
    "/delegation/:path*",
    "/settings/:path*",
    "/projects/:path*",
    "/history/:path*",
  ],
}
