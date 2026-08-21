import type { Payload } from 'payload'
import { devUser } from './helpers/credentials.js'

/**
 * Seeds a dev user and one designed `guest-confirmation` template so the admin
 * list view and the E2E/screenshot suite have something to show on first boot.
 */
export const seed = async (payload: Payload) => {
  const { totalDocs: userCount } = await payload.count({
    collection: 'users',
    where: { email: { equals: devUser.email } },
  })

  if (!userCount) {
    await payload.create({ collection: 'users', data: devUser })
  }

  const { totalDocs: templateCount } = await payload.count({
    collection: 'email-templates',
    where: { key: { equals: 'guest-confirmation' } },
  })

  if (!templateCount) {
    await payload.create({
      collection: 'email-templates',
      data: {
        key: 'guest-confirmation',
        subject: 'Your gift is confirmed, {{guest_name}}',
        preview: 'Thanks for your contribution',
        design: {
          json: null,
          html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"></head><body style="margin:0;padding:0;background-color:#f4f4f5;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;width:100%;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" class="email-shell__card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:8px;"><tr><td class="email-shell__content" style="padding:32px 40px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#27272a;"><h1>Thank you, {{guest_name}}</h1><p>Your gift of {{amount}} towards {{couple_names}}’s gift list has been received.</p><p>{{gift_summary}}</p><p style="color:#888">Transaction ID: {{transaction_id}}</p></td></tr></table></td></tr></table></body></html>',
          text: 'Thank you, {{guest_name}}. Your gift of {{amount}} towards {{couple_names}} has been received. Transaction ID: {{transaction_id}}',
        },
      },
    })
  }
}
