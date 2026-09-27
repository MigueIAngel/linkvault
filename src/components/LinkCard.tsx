'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useOptimistic, useState, useTransition } from 'react'
import { deleteLinkAction, toggleFavoriteAction, updateLinkAction } from '@/actions/links'

export interface LinkCardData {
  id: string
  url: string
  title: string
  description: string | null
  domain: string
  isFavorite: boolean
  createdAt: Date
  tags: { name: string }[]
}

/** `now` comes from the server render so relative dates match during hydration. */
export function LinkCard({ link, now }: { link: LinkCardData; now: Date }) {
  const t = useTranslations('Links')
  const format = useFormatter()
  const [editing, setEditing] = useState(false)
  const [, startTransition] = useTransition()
  // Optimistic favorite: the star flips instantly while the Server Action runs.
  const [favorite, setOptimisticFavorite] = useOptimistic(link.isFavorite)

  function toggleFavorite() {
    startTransition(async () => {
      setOptimisticFavorite(!favorite)
      await toggleFavoriteAction(link.id, !favorite)
    })
  }

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateLinkAction(link.id, formData)
          setEditing(false)
        }}
        className="space-y-2 rounded-2xl border border-vault-500 bg-white p-4 dark:bg-zinc-900"
      >
        <input name="title" className="input" defaultValue={link.title} required aria-label={t('titleLabel')} />
        <textarea name="description" className="input" rows={2} defaultValue={link.description ?? ''} aria-label={t('descriptionLabel')} />
        <input name="tags" className="input" defaultValue={link.tags.map((tag) => tag.name).join(', ')} aria-label={t('tags')} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
            {t('cancel')}
          </button>
          <button type="submit" className="btn-primary">
            {t('save')}
          </button>
        </div>
      </form>
    )
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-vault-500/60 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${link.domain}&sz=64`}
          alt=""
          width={32}
          height={32}
          className="mt-0.5 rounded-md bg-zinc-100 p-1 dark:bg-zinc-800"
        />
        <div className="min-w-0 flex-1">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="line-clamp-2 font-medium hover:text-vault-600">
            {link.title}
          </a>
          <p className="truncate text-xs text-zinc-500">{link.domain}</p>
        </div>
        <button
          type="button"
          onClick={toggleFavorite}
          className={`text-lg ${favorite ? 'text-amber-400' : 'text-zinc-300 hover:text-amber-400 dark:text-zinc-600'}`}
          aria-pressed={favorite}
          aria-label={favorite ? t('unfavorite') : t('favorite')}
          title={favorite ? t('unfavorite') : t('favorite')}
        >
          ★
        </button>
      </div>
      {link.description && <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{link.description}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
        {link.tags.map((tag) => (
          <span key={tag.name} className="rounded-full bg-vault-50 px-2 py-0.5 text-xs text-vault-700 dark:bg-vault-500/10 dark:text-vault-400">
            #{tag.name}
          </span>
        ))}
        <span className="ml-auto text-xs text-zinc-400">
          {t('savedAt', { date: format.relativeTime(link.createdAt, now) })}
        </span>
      </div>
      <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3 text-xs opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 dark:border-zinc-800">
        <button type="button" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white" onClick={() => setEditing(true)}>
          {t('edit')}
        </button>
        <button
          type="button"
          className="text-red-500 hover:text-red-700"
          onClick={() => {
            if (window.confirm(t('confirmDelete'))) startTransition(() => deleteLinkAction(link.id))
          }}
        >
          {t('delete')}
        </button>
      </div>
    </article>
  )
}
