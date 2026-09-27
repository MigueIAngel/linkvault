'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { createLinkAction, type LinkFormState } from '@/actions/links'

export function AddLinkForm() {
  const t = useTranslations('Links')
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState<LinkFormState, FormData>(createLinkAction, {})

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  return (
    <form ref={formRef} action={action} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-2 md:flex-row">
        <input name="url" className="input md:flex-[2]" placeholder={t('urlPlaceholder')} required aria-label="URL" />
        <input name="tags" className="input md:flex-1" placeholder={t('tagsPlaceholder')} aria-label={t('tags')} />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={pending}>
          {pending ? t('saving') : `+ ${t('add')}`}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {t(`errors.${state.error}`)}
        </p>
      )}
    </form>
  )
}
