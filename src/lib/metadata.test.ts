import { afterEach, describe, expect, it, vi } from 'vitest'
import { extractMetadata, fetchMetadata } from './metadata'

describe('extractMetadata', () => {
  it('prefers Open Graph tags', () => {
    const html = `
      <head>
        <title>Fallback</title>
        <meta property="og:title" content="OG &amp; Title">
        <meta content="OG description" property="og:description">
      </head>`
    expect(extractMetadata(html)).toEqual({ title: 'OG & Title', description: 'OG description' })
  })

  it('falls back to <title> and meta description', () => {
    const html = '<title>  Plain\n title </title><meta name="description" content="Desc">'
    expect(extractMetadata(html)).toEqual({ title: 'Plain title', description: 'Desc' })
  })

  it('returns nothing for pages without metadata', () => {
    expect(extractMetadata('<html></html>')).toEqual({ title: undefined, description: undefined })
  })
})

describe('fetchMetadata', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('never requests private hosts', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchMetadata('http://169.254.169.254/latest/meta-data')).toEqual({})
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ignores non-HTML responses and network errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { headers: { 'content-type': 'application/json' } })),
    )
    expect(await fetchMetadata('https://api.example.com')).toEqual({})

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    expect(await fetchMetadata('https://slow.example.com')).toEqual({})
  })

  it('parses HTML responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<title>Hello</title>', { headers: { 'content-type': 'text/html; charset=utf-8' } }),
      ),
    )
    expect(await fetchMetadata('https://example.com')).toEqual({ title: 'Hello', description: undefined })
  })
})
