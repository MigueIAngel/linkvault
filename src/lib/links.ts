import 'server-only'
import type { Prisma } from '@/generated/prisma/client'
import { db } from './db'

export const PAGE_SIZE = 12

export interface LinkFilters {
  q?: string
  tag?: string
  favorites?: boolean
  limit?: number
}

export async function getLinks(userId: string, filters: LinkFilters) {
  const where: Prisma.LinkWhereInput = {
    userId,
    ...(filters.favorites ? { isFavorite: true } : {}),
    ...(filters.tag ? { tags: { some: { name: filters.tag } } } : {}),
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: 'insensitive' } },
            { description: { contains: filters.q, mode: 'insensitive' } },
            { url: { contains: filters.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [links, total] = await db.$transaction([
    db.link.findMany({
      where,
      include: { tags: { select: { name: true }, orderBy: { name: 'asc' } } },
      orderBy: [{ isFavorite: 'desc' }, { createdAt: 'desc' }],
      take: filters.limit ?? PAGE_SIZE,
    }),
    db.link.count({ where }),
  ])
  return { links, total }
}

export async function getTagsWithCount(userId: string) {
  const tags = await db.tag.findMany({
    where: { userId, links: { some: {} } },
    select: { name: true, _count: { select: { links: true } } },
    orderBy: { name: 'asc' },
  })
  return tags.map((tag) => ({ name: tag.name, count: tag._count.links }))
}

export type LinkWithTags = Awaited<ReturnType<typeof getLinks>>['links'][number]
