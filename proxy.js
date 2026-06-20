// middleware.js  (root of project)
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role

    if (pathname.startsWith('/dashboard/supervisor') && role !== 'SUPERVISOR')
      return NextResponse.redirect(new URL(`/dashboard/${role?.toLowerCase()}`, req.url))

    if (pathname.startsWith('/dashboard/manager') && role !== 'MANAGER')
      return NextResponse.redirect(new URL(`/dashboard/${role?.toLowerCase()}`, req.url))

    if (pathname.startsWith('/dashboard/executor') && role !== 'EXECUTOR')
      return NextResponse.redirect(new URL(`/dashboard/${role?.toLowerCase()}`, req.url))

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
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