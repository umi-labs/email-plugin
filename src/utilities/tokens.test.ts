import { describe, expect, it } from 'vitest'
import { applyTokens, formatCurrency, formatPence } from './tokens.js'

describe('formatCurrency / formatPence', () => {
  it('formats integer pence as GBP', () => {
    expect(formatPence(4200)).toBe('£42.00')
    expect(formatPence(100000)).toBe('£1,000.00')
  })

  it('supports other currencies/locales', () => {
    expect(formatCurrency(4200, 'EUR', 'en-IE')).toBe('€42.00')
    expect(formatCurrency(500, 'USD', 'en-US')).toBe('$5.00')
  })
})

describe('applyTokens', () => {
  it('replaces known tokens', () => {
    expect(applyTokens('Hi {{name}}', { name: 'Sam' })).toBe('Hi Sam')
  })

  it('HTML-escapes values by default', () => {
    expect(applyTokens('{{msg}}', { msg: '<b>&"' })).toBe('&lt;b&gt;&amp;&quot;')
  })

  it('does not escape when escape=false (plain text)', () => {
    expect(applyTokens('{{msg}}', { msg: 'a & b' }, false)).toBe('a & b')
  })

  it('leaves unknown tokens untouched', () => {
    expect(applyTokens('{{a}} {{b}}', { a: '1' })).toBe('1 {{b}}')
  })
})
