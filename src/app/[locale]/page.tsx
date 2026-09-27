import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { Logo } from '@/components/Logo'
import { Link } from '@/i18n/navigation'

export default async function LandingPage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Landing')
  const nav = await getTranslations('Nav')
  const session = await auth()

  const features = ['fetch', 'tags', 'search'] as const
  const icons = { fetch: '⚡', tags: '🏷️', search: '🔎' }

  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          <Suspense>
            <LocaleSwitcher />
          </Suspense>
          {session ? (
            <Link href="/links" className="btn-primary">
              {nav('dashboard')}
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                {nav('login')}
              </Link>
              <Link href="/register" className="btn-primary">
                {nav('register')}
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <section className="py-20 text-center">
          <span className="rounded-full border border-vault-500/30 bg-vault-50 px-3 py-1 text-xs font-medium text-vault-700 dark:bg-vault-500/10 dark:text-vault-400">
            {t('badge')}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">{t('title')}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">{t('subtitle')}</p>
          <div className="mt-10 flex justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              {t('cta')}
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              {t('demo')}
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-24 md:grid-cols-3">
          {features.map((key) => (
            <article key={key} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-2xl">{icons[key]}</span>
              <h2 className="mt-3 font-semibold">{t(`features.${key}.title`)}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t(`features.${key}.text`)}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}
