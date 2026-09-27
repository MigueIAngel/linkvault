'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'

export function SearchBox() {
  const t = useTranslations('Links')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (value === current) return
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (value) params.set('q', value)
      else params.delete('q')
      params.delete('limit')
      startTransition(() => router.replace(`${pathname}?${params}`))
    }, 300)
    return () => clearTimeout(timer)
  }, [value, searchParams, pathname, router])

  return (
    <div className="relative">
      <input
        type="search"
        className="input pr-8"
        placeholder={t('search')}
        aria-label={t('search')}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {isPending && <span className="absolute top-2.5 right-3 h-3 w-3 animate-spin rounded-full border-2 border-vault-500 border-t-transparent" />}
    </div>
  )
}
