'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { type AuthFormState, loginAction, registerAction } from '@/actions/auth'
import { Link } from '@/i18n/navigation'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const t = useTranslations('Auth')
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    mode === 'login' ? loginAction : registerAction,
    {},
  )

  return (
    <form action={action} className="space-y-4">
      {mode === 'register' && (
        <label className="block text-sm font-medium">
          {t('name')}
          <input name="name" className="input mt-1" required minLength={2} defaultValue={state.fields?.name} />
        </label>
      )}
      <label className="block text-sm font-medium">
        {t('email')}
        <input name="email" type="email" className="input mt-1" required autoComplete="email" defaultValue={state.fields?.email} />
      </label>
      <label className="block text-sm font-medium">
        {t('password')}
        <input
          name="password"
          type="password"
          className="input mt-1"
          required
          minLength={8}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {t(`errors.${state.error}`)}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {t(mode === 'login' ? 'login' : 'register')}
      </button>
      <p className="text-center text-sm text-zinc-500">
        {t(mode === 'login' ? 'noAccount' : 'haveAccount')}{' '}
        <Link href={mode === 'login' ? '/register' : '/login'} className="font-medium text-vault-600 hover:underline">
          {t(mode === 'login' ? 'register' : 'login')}
        </Link>
      </p>
    </form>
  )
}
