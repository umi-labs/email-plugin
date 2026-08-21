import { describe, expect, it } from 'vitest'
import { shouldSend } from './shouldSend.js'

describe('shouldSend', () => {
  it('sends on the pending→completed transition when not already sent', () => {
    expect(shouldSend('pending', 'completed', undefined)).toBe(true)
    expect(shouldSend(undefined, 'completed', null)).toBe(true)
  })

  it('does not send if already completed before', () => {
    expect(shouldSend('completed', 'completed', undefined)).toBe(false)
  })

  it('does not send if already sent', () => {
    expect(shouldSend('pending', 'completed', '2026-01-01T00:00:00Z')).toBe(false)
  })

  it('does not send for non-completed next status', () => {
    expect(shouldSend('pending', 'failed', undefined)).toBe(false)
    expect(shouldSend('pending', 'pending', undefined)).toBe(false)
  })

  it('supports a custom completed status', () => {
    expect(shouldSend('new', 'paid', undefined, 'paid')).toBe(true)
    expect(shouldSend('paid', 'paid', undefined, 'paid')).toBe(false)
  })
})
