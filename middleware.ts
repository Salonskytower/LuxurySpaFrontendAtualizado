import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verifica se é uma rota admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Pega o token/user do cookie ou header (exemplo)
    const userCookie = request.cookies.get('user')
    
    if (!userCookie) {
      // Usuário não logado - redireciona para login
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('login', 'true')
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const userData = JSON.parse(userCookie.value)
      
      if (userData.userType !== 'admin') {
        // Usuário não é admin - redireciona para home
        const homeUrl = new URL('/', request.url)
        homeUrl.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(homeUrl)
      }
    } catch (error: any) {
      // Cookie inválido - redireciona para login
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('login', 'true')
      console.error(error)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}