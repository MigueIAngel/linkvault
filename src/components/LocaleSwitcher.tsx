'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const t = useTranslations('Nav')
  const locale = useLocale()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const next = locale === 'en' ? 'es' : 'en'

  return (
    <button
      type="button"
      className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
      onClick={() => {
        const query = searchParams.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, { locale: next })
      }}
    >
      🌐 {t('language')}
    </button>
  )
}
