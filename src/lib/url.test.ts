import { describe, expect, it } from 'vitest'
import { domainOf, isPublicHost, normalizeUrl, parseTags } from './url'

describe('normalizeUrl', () => {
  it('adds https:// when the scheme is missing', () => {
    expect(normalizeUrl('nextjs.org/docs')).toBe('https://nextjs.org/docs')
  })

  it('keeps http(s) URLs and drops the fragment', () => {
    expect(normalizeUrl(' https://example.com/a?b=1#section ')).toBe('https://example.com/a?b=1')
  })

  it('rejects other protocols and invalid input', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBeNull()
    expect(normalizeUrl('ftp://example.com')).toBeNull()
    expect(normalizeUrl('not a url')).toBeNull()
    expect(normalizeUrl('localhost')).toBeNull()
    expect(normalizeUrl('')).toBeNull()
  })
})

describe('isPublicHost', () => {
  it.each(['localhost', '127.0.0.1', '10.0.0.5', '192.168.1.1', '172.20.0.1', '169.254.169.254', 'db.internal'])(
    'blocks %s',
    (host) => expect(isPublicHost(host)).toBe(false),
  )

  it('allows public hosts', () => {
    expect(isPublicHost('github.com')).toBe(true)
    expect(isPublicHost('172.15.0.1')).toBe(true)
  })
})

describe('parseTags', () => {
  it('normalizes, dedupes and limits tags', () => {
    expect(parseTags(' React, react ,Next JS,, a,b,c,d')).toEqual(['react', 'next-js', 'a', 'b', 'c'])
  })
})

describe('domainOf', () => {
  it('strips www', () => {
    expect(domainOf('https://www.prisma.io/docs')).toBe('prisma.io')
  })
})
