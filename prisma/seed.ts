import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../src/generated/prisma/client'

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const LINKS = [
  {
    url: 'https://nextjs.org/docs',
    title: 'Next.js Documentation',
    description: 'App Router, Server Components and Server Actions.',
    tags: ['nextjs', 'react'],
    isFavorite: true,
  },
  {
    url: 'https://www.prisma.io/docs',
    title: 'Prisma Documentation',
    description: 'Type-safe ORM for Node.js and TypeScript.',
    tags: ['database', 'typescript'],
  },
  {
    url: 'https://authjs.dev',
    title: 'Auth.js',
    description: 'Authentication for the web.',
    tags: ['auth', 'nextjs'],
  },
  {
    url: 'https://tailwindcss.com/docs',
    title: 'Tailwind CSS',
    description: 'Utility-first CSS framework.',
    tags: ['css'],
    isFavorite: true,
  },
  {
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    title: 'HTTP | MDN',
    description: 'Everything about the HTTP protocol.',
    tags: ['web', 'reference'],
  },
  {
    url: 'https://www.postgresql.org/docs/current/',
    title: 'PostgreSQL Documentation',
    tags: ['database', 'reference'],
  },
]

async function main() {
  const email = 'demo@linkvault.dev'
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    console.log('Demo user already exists, skipping seed.')
    return
  }

  const user = await db.user.create({
    data: { email, name: 'Demo User', passwordHash: await bcrypt.hash('demo12345', 10) },
  })

  for (const link of LINKS) {
    await db.link.create({
      data: {
        url: link.url,
        title: link.title,
        description: link.description,
        domain: new URL(link.url).hostname.replace(/^www\./, ''),
        isFavorite: link.isFavorite ?? false,
        userId: user.id,
        tags: {
          connectOrCreate: link.tags.map((name) => ({
            where: { userId_name: { userId: user.id, name } },
            create: { name, userId: user.id },
          })),
        },
      },
    })
  }
  console.log('Demo data created (demo@linkvault.dev / demo12345).')
}

main().finally(() => db.$disconnect())
