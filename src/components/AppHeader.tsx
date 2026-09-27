import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'
import { logoutAction } from '@/actions/auth'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Logo } from './Logo'

export async function AppHeader({ email }: { email?: string | null }) {
  const t = await getTranslations('Nav')
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <Suspense>
            <LocaleSwitcher />
          </Suspense>
          {email && <span className="hidden text-sm text-zinc-500 sm:inline">{email}</span>}
          <form action={logoutAction}>
            <button type="submit" className="btn-secondary py-1.5">
              {t('logout')}
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
