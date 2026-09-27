'use server'

import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { getLocale } from 'next-intl/server'
import { z } from 'zod'
import { signIn, signOut } from '@/auth'
import { db } from '@/lib/db'

export interface AuthFormState {
  error?: 'invalidCredentials' | 'emailTaken' | 'invalid' | 'generic'
  fields?: Record<string, string>
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(100),
})

async function signInWithCredentials(email: string, password: string): Promise<AuthFormState> {
  const locale = await getLocale()
  try {
    await signIn('credentials', { email, password, redirectTo: `/${locale}/links` })
    return {}
  } catch (error) {
    // signIn() throws a redirect on success, which must be re-thrown.
    if (error instanceof AuthError) {
      return { error: error.type === 'CredentialsSignin' ? 'invalidCredentials' : 'generic' }
    }
    throw error
  }
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const state = await signInWithCredentials(email, password)
  return { ...state, fields: { email } }
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = registerSchema.safeParse(raw)
  const fields = { name: raw.name ?? '', email: raw.email ?? '' }
  if (!parsed.success) return { error: 'invalid', fields }

  const { name, email, password } = parsed.data
  if (await db.user.findUnique({ where: { email } })) return { error: 'emailTaken', fields }

  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10) } })
  return signInWithCredentials(email, password)
}

export async function githubSignInAction() {
  const locale = await getLocale()
  await signIn('github', { redirectTo: `/${locale}/links` })
}

export async function logoutAction() {
  const locale = await getLocale()
  await signOut({ redirectTo: `/${locale}` })
}
