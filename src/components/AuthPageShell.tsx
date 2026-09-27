import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { githubSignInAction } from '@/actions/auth'
import { githubEnabled } from '@/auth'
import { AuthForm } from './AuthForm'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Logo } from './Logo'

export async function AuthPageShell({ mode }: { mode: 'login' | 'register' }) {
  const t = await getTranslations('Auth')
  return (
    <main className="relative grid flex-1 place-items-center px-4 py-16">
      <div className="absolute top-4 right-4">
        <Suspense>
          <LocaleSwitcher />
        </Suspense>
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-6 text-xl font-semibold">{t(mode === 'login' ? 'loginTitle' : 'registerTitle')}</h1>
          {githubEnabled && (
            <>
              <form action={githubSignInAction}>
                <button type="submit" className="btn-secondary w-full">
                  {t('github')}
                </button>
              </form>
              <p className="my-4 text-center text-xs text-zinc-400 uppercase">{t('or')}</p>
            </>
          )}
          <AuthForm mode={mode} />
        </div>
        {mode === 'login' && <p className="mt-4 text-center text-xs text-zinc-500">{t('demoHint')}</p>}
      </div>
    </main>
  )
}
