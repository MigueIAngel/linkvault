'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { currentUserId } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { db } from '@/lib/db'
import { fetchMetadata } from '@/lib/metadata'
import { domainOf, normalizeUrl, parseTags } from '@/lib/url'

export interface LinkFormState {
  error?: 'invalidUrl' | 'duplicate' | 'generic'
  ok?: number
}

async function requireUser(): Promise<string> {
  const userId = await currentUserId()
  if (!userId) throw new Error('Unauthorized')
  return userId
}

function tagsInput(userId: string, names: string[]) {
  return names.map((name) => ({
    where: { userId_name: { userId, name } },
    create: { name, userId },
  }))
}

const refresh = () => revalidatePath('/[locale]/links', 'page')

export async function createLinkAction(_prev: LinkFormState, formData: FormData): Promise<LinkFormState> {
  const userId = await requireUser()
  const url = normalizeUrl(String(formData.get('url') ?? ''))
  if (!url) return { error: 'invalidUrl' }

  const metadata = await fetchMetadata(url)
  try {
    await db.link.create({
      data: {
        url,
        userId,
        domain: domainOf(url),
        title: metadata.title ?? domainOf(url),
        description: metadata.description,
        tags: { connectOrCreate: tagsInput(userId, parseTags(String(formData.get('tags') ?? ''))) },
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: 'duplicate' }
    }
    return { error: 'generic' }
  }
  refresh()
  return { ok: Date.now() }
}

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500),
  tags: z.string(),
})

export async function updateLinkAction(id: string, formData: FormData): Promise<void> {
  const userId = await requireUser()
  const data = updateSchema.parse(Object.fromEntries(formData))
  // Scoping by userId makes updates to other users' links impossible.
  const link = await db.link.findFirst({ where: { id, userId }, select: { id: true } })
  if (!link) return
  await db.link.update({
    where: { id: link.id },
    data: {
      title: data.title,
      description: data.description || null,
      tags: { set: [], connectOrCreate: tagsInput(userId, parseTags(data.tags)) },
    },
  })
  refresh()
}

export async function toggleFavoriteAction(id: string, isFavorite: boolean): Promise<void> {
  const userId = await requireUser()
  await db.link.updateMany({ where: { id, userId }, data: { isFavorite } })
  refresh()
}

export async function deleteLinkAction(id: string): Promise<void> {
  const userId = await requireUser()
  await db.link.deleteMany({ where: { id, userId } })
  refresh()
}
