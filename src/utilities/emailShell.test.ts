import { describe, expect, it } from 'vitest'
import { createEmailShell, wrapEmailHtml } from './emailShell.js'

const doc = (body: string) =>
  `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"></head><body>${body}</body></html>`

describe('wrapEmailHtml (defaults)', () => {
  it('returns empty/blank input unchanged', () => {
    expect(wrapEmailHtml('')).toBe('')
    expect(wrapEmailHtml('   ')).toBe('   ')
  })

  it('moves the body content into a styled centered card', () => {
    const out = wrapEmailHtml(doc('<p>Hello</p>'))
    expect(out).toContain('email-shell__card')
    expect(out).toContain('email-shell__content')
    expect(out).toContain('<p>Hello</p>')
    expect(out).toContain('background-color:#f4f4f5')
    expect(out).toContain('max-width:600px')
  })

  it('preserves the document head and injects default styles', () => {
    const out = wrapEmailHtml(doc('<p>Hi</p>'))
    expect(out).toContain('width=device-width')
    expect(out).toContain('<style>')
    expect(out).toContain('email-shell__content h1')
  })

  it('is idempotent (does not double-wrap)', () => {
    const once = wrapEmailHtml(doc('<p>Hi</p>'))
    const twice = wrapEmailHtml(once)
    expect(twice).toBe(once)
  })

  it('wraps a bare fragment into a full styled document', () => {
    const out = wrapEmailHtml('<p>Fragment</p>')
    expect(out).toContain('<!DOCTYPE html>')
    expect(out).toContain('email-shell__card')
    expect(out).toContain('<p>Fragment</p>')
  })
})

describe('createEmailShell (custom options)', () => {
  it('applies custom colours and width', () => {
    const wrap = createEmailShell({ pageBackground: '#001122', maxWidth: 720, linkColor: '#ff0000' })
    const out = wrap(doc('<p>Hi</p>'))
    expect(out).toContain('background-color:#001122')
    expect(out).toContain('max-width:720px')
    expect(out).toContain('color:#ff0000')
  })
})
