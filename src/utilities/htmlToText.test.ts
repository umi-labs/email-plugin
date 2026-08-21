import { describe, expect, it } from 'vitest'
import { htmlToText } from './htmlToText.js'

describe('htmlToText', () => {
  it('strips tags and decodes common entities', () => {
    expect(htmlToText('<p>Hi <b>Sam</b> &amp; Jo</p>')).toBe('Hi Sam & Jo')
  })

  it('turns block boundaries into newlines', () => {
    expect(htmlToText('<h1>Title</h1><p>Line one</p><p>Line two</p>')).toBe(
      'Title\nLine one\nLine two',
    )
  })

  it('returns empty string for empty input', () => {
    expect(htmlToText('')).toBe('')
  })
})
