import { isPublicHost } from './url'

export interface PageMetadata {
  title?: string
  description?: string
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'" }

function decode(text: string): string {
  return text
    .replace(/&(amp|lt|gt|quot|#39|apos);/g, (_, entity: string) => ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim()
}

function metaContent(html: string, key: string): string | undefined {
  // Matches <meta property|name="key" content="..."> in either attribute order.
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(html)
    if (match?.[1]) return decode(match[1])
  }
}

/** Extracts the best title and description from an HTML document. */
export function extractMetadata(html: string): PageMetadata {
  const title =
    metaContent(html, 'og:title') ??
    metaContent(html, 'twitter:title') ??
    (() => {
      const match = /<title[^>]*>([^<]*)<\/title>/i.exec(html)
      return match?.[1] ? decode(match[1]) : undefined
    })()
  const description =
    metaContent(html, 'og:description') ?? metaContent(html, 'description') ?? metaContent(html, 'twitter:description')
  return {
    title: title?.slice(0, 200) || undefined,
    description: description?.slice(0, 500) || undefined,
  }
}

/** Fetches a page with a timeout and size limit and returns its metadata. Never throws. */
export async function fetchMetadata(url: string, timeoutMs = 5000): Promise<PageMetadata> {
  try {
    const { hostname } = new URL(url)
    if (!isPublicHost(hostname)) return {}
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': 'LinkVaultBot/1.0 (+https://github.com/MigueIAngel/linkvault)', accept: 'text/html' },
      redirect: 'follow',
    })
    if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return {}
    const html = (await response.text()).slice(0, 300_000)
    return extractMetadata(html)
  } catch {
    return {}
  }
}
