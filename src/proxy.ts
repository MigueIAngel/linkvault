import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Locale detection and prefixing (`/en/...`, `/es/...`).
export default createMiddleware(routing)

export const config = {
  // Skip API routes, Next.js internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
