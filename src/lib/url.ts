const PRIVATE_HOST = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\./,
  /^\[?::1\]?$/,
  /\.local$/i,
  /\.internal$/i,
]

/** Accepts `example.com/page` or full URLs; returns a normalized http(s) URL or null. */
export function normalizeUrl(input: string): string | null {
  const value = input.trim()
  if (!value) return null
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

/** Basic SSRF guard: metadata is only fetched from public hosts. */
export function isPublicHost(hostname: string): boolean {
  return !PRIVATE_HOST.some((pattern) => pattern.test(hostname))
}

export function domainOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '')
}

export function parseTags(input: string, max = 5): string[] {
  const tags = input
    .split(',')
    .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter((tag) => tag.length > 0 && tag.length <= 30)
  return [...new Set(tags)].slice(0, max)
}
