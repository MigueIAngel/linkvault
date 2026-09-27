import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import { z } from 'zod'
import { db } from '@/lib/db'

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw)
      if (!parsed.success) return null
      const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } })
      if (!user?.passwordHash) return null
      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
      return valid ? { id: user.id, name: user.name, email: user.email, image: user.image } : null
    },
  }),
]

// GitHub login is enabled only when an OAuth app is configured.
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub)

export const githubEnabled = providers.length > 1

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0]),
  // JWT sessions are required by the Credentials provider.
  session: { strategy: 'jwt' },
  providers,
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})

/** Returns the signed-in user id or null. */
export async function currentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
