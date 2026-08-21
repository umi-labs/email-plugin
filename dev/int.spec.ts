import type { Payload } from 'payload'
import config from '@payload-config'
import { getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createEmailRenderer, renderTemplate } from '@foundrykit/email-plugin'
import { capturedEmails } from './helpers/testEmailAdapter.js'
import { emailConfig } from './emailConfig.js'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  await payload.destroy()
})

describe('emailPlugin wiring', () => {
  test('registers the email-templates collection', () => {
    expect(payload.collections['email-templates']).toBeDefined()
  })

  test('registers the email-settings global', () => {
    expect(payload.config.globals.some((g) => g.slug === 'email-settings')).toBe(true)
  })

  test('key select options come from the configured templates', () => {
    const collection = payload.collections['email-templates']
    const keyField = collection.config.fields.find(
      (f) => 'name' in f && f.name === 'key',
    ) as { options: { value: string }[] }
    const values = keyField.options.map((o) => o.value)
    expect(values).toEqual([
      'guest-confirmation',
      'voucher-confirmation',
      'couple-notification',
    ])
  })

  test('can create an email-template document', async () => {
    const doc = await payload.create({
      collection: 'email-templates',
      data: {
        key: 'voucher-confirmation',
        subject: 'Your {{voucher_title}} is ready',
        design: {
          html: '<body><p>Hello {{buyer_name}}, your {{voucher_title}} ({{amount}}) is confirmed.</p></body>',
          text: 'Hello {{buyer_name}}, your {{voucher_title}} ({{amount}}) is confirmed.',
        },
      },
    })
    expect(doc.id).toBeDefined()
    expect(doc.key).toBe('voucher-confirmation')
  })
})

describe('renderTemplate', () => {
  const opts = {
    collectionSlug: 'email-templates',
    templates: emailConfig.templates,
    shell: emailConfig.shell ?? {},
  }

  test('substitutes tokens into the saved subject + html', async () => {
    const rendered = await renderTemplate(
      payload,
      'voucher-confirmation',
      { buyer_name: 'Alex', voucher_title: '£500 Voucher', amount: '£500.00' },
      opts,
    )
    expect(rendered.subject).toBe('Your £500 Voucher is ready')
    expect(rendered.html).toContain('Hello Alex')
    expect(rendered.html).toContain('£500 Voucher')
    expect(rendered.text).toContain('Hello Alex')
  })

  test('HTML-escapes token values in the html part', async () => {
    const rendered = await renderTemplate(
      payload,
      'voucher-confirmation',
      { buyer_name: '<script>', voucher_title: 'V', amount: 'A' },
      opts,
    )
    expect(rendered.html).toContain('&lt;script&gt;')
    expect(rendered.html).not.toContain('<script>')
  })

  test('falls back to defaultSubject + fallbackHtml when no document design exists', async () => {
    // guest-confirmation is seeded with a design, so use couple-notification
    // which has no saved doc → exercises the config fallback path.
    const rendered = await renderTemplate(
      payload,
      'couple-notification',
      { couple_names: 'Sam & Jordan', contributor_name: 'Alex', amount: '£150.00' },
      opts,
    )
    expect(rendered.subject).toBe('New gift for Sam & Jordan')
    // couple-notification has no fallbackHtml → minimal shell-wrapped body
    expect(rendered.html).toContain('email-shell__card')
  })

  test('leaves unknown/typo tokens visible', async () => {
    const rendered = await renderTemplate(
      payload,
      'voucher-confirmation',
      { buyer_name: 'Alex' },
      opts,
    )
    expect(rendered.html).toContain('{{voucher_title}}')
  })
})

describe('createEmailRenderer.sendTemplate', () => {
  test('renders and dispatches through payload.sendEmail', async () => {
    capturedEmails.length = 0
    const email = createEmailRenderer(emailConfig)
    await email.sendTemplate(payload, {
      key: 'guest-confirmation',
      to: 'guest@example.com',
      values: {
        guest_name: 'Alex Morgan',
        couple_names: 'Sam & Jordan',
        amount: '£150.00',
        gift_summary: 'Honeymoon',
        transaction_id: 'TXN-1',
      },
    })
    expect(capturedEmails).toHaveLength(1)
    expect(capturedEmails[0].to).toBe('guest@example.com')
    expect(String(capturedEmails[0].subject)).toContain('Alex Morgan')
    expect(String(capturedEmails[0].html)).toContain('Alex Morgan')
  })
})
