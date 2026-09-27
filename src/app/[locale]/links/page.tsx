import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { AddLinkForm } from '@/components/AddLinkForm'
import { AppHeader } from '@/components/AppHeader'
import { LinkCard } from '@/components/LinkCard'
import { SearchBox } from '@/components/SearchBox'
import { Link } from '@/i18n/navigation'
import { getLinks, getTagsWithCount, PAGE_SIZE } from '@/lib/links'

type Query = Record<string, string | undefined>

function href(current: Query, changes: Query) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...current, ...changes })) if (value) params.set(key, value)
  const query = params.toString()
  return query ? `/links?${query}` : '/links'
}

export default async function LinksPage({ params, searchParams }: PageProps<'/[locale]/links'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await auth()
  if (!session?.user?.id) redirect(`/${locale}/login`)

  const raw = await searchParams
  const query: Query = {
    q: typeof raw.q === 'string' ? raw.q : undefined,
    tag: typeof raw.tag === 'string' ? raw.tag : undefined,
    fav: raw.fav === '1' ? '1' : undefined,
  }
  const limit = Math.min(Number(raw.limit) || PAGE_SIZE, 200)

  const t = await getTranslations('Links')
  const [{ links, total }, tags] = await Promise.all([
    getLinks(session.user.id, { q: query.q, tag: query.tag, favorites: Boolean(query.fav), limit }),
    getTagsWithCount(session.user.id),
  ])
  const now = new Date()
  const filtered = Boolean(query.q || query.tag || query.fav)

  const navItem = (active: boolean) =>
    `flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${
      active ? 'bg-vault-50 font-medium text-vault-700 dark:bg-vault-500/10 dark:text-vault-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
    }`

  return (
    <>
      <AppHeader email={session.user.email} />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          <Link href="/links" className={navItem(!filtered)}>
            {t('all')}
          </Link>
          <Link href={href({}, { fav: '1' })} className={navItem(Boolean(query.fav))}>
            ★ {t('favorites')}
          </Link>
          {tags.length > 0 && <p className="px-3 pt-4 pb-1 text-xs font-semibold tracking-wide text-zinc-400 uppercase">{t('tags')}</p>}
          {tags.map((tag) => (
            <Link key={tag.name} href={href({}, { tag: tag.name })} className={navItem(query.tag === tag.name)}>
              <span>#{tag.name}</span>
              <span className="text-xs text-zinc-400">{tag.count}</span>
            </Link>
          ))}
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{query.tag ? `#${query.tag}` : query.fav ? t('favorites') : t('title')}</h1>
              <p className="text-sm text-zinc-500">{t('count', { count: total })}</p>
            </div>
            <div className="w-full sm:w-72">
              <Suspense>
                <SearchBox />
              </Suspense>
            </div>
          </div>

          <AddLinkForm />

          {links.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
              {filtered ? t('noResults') : t('empty')}
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} now={now} />
              ))}
            </div>
          )}

          {links.length < total && (
            <div className="flex justify-center">
              <Link href={href(query, { limit: String(limit + PAGE_SIZE) })} className="btn-secondary" scroll={false}>
                {t('loadMore')}
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
