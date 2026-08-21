import type { EmailPluginConfig } from '../src/index.js'

/**
 * Shared plugin config for the dev app + tests. These three templates mirror a
 * realistic transactional setup (a wedding/honeymoon gift flow) purely as an
 * example of the config shape — none of it is baked into the plugin.
 */
export const emailConfig: EmailPluginConfig = {
  adminGroup: 'Email',
  branding: {
    fromName: 'Acme Travel',
    fromEmail: 'hello@example.com',
    replyTo: 'hello@example.com',
    supportContact: 'support@example.com',
  },
  templates: [
    {
      key: 'guest-confirmation',
      label: 'Guest contribution confirmation',
      defaultSubject: 'Your gift is confirmed',
      fallbackHtml:
        '<h1>Thank you, {{guest_name}}</h1><p>Your gift of {{amount}} towards {{couple_names}} has been received.</p><p>Transaction ID: {{transaction_id}}</p>',
      tokens: [
        { name: 'guest_name', label: 'Guest name', sample: 'Alex Morgan' },
        { name: 'couple_names', label: 'Couple names', sample: 'Sam & Jordan' },
        { name: 'amount', label: 'Amount', sample: '£150.00' },
        { name: 'gift_summary', label: 'Gift summary', sample: 'Honeymoon in the Maldives' },
        { name: 'transaction_id', label: 'Transaction ID', sample: 'TXN-10293847' },
      ],
    },
    {
      key: 'voucher-confirmation',
      label: 'Voucher purchase confirmation',
      defaultSubject: 'Your voucher purchase',
      tokens: [
        { name: 'buyer_name', label: 'Buyer name', sample: 'Alex Morgan' },
        { name: 'voucher_title', label: 'Voucher title', sample: '£500 Gift of Travel Voucher' },
        { name: 'amount', label: 'Amount', sample: '£500.00' },
        { name: 'transaction_id', label: 'Transaction ID', sample: 'gov-1024-ab12cd34' },
      ],
    },
    {
      key: 'couple-notification',
      label: 'Couple contribution notification',
      defaultSubject: 'New gift for {{couple_names}}',
      tokens: [
        { name: 'couple_names', label: 'Couple names', sample: 'Sam & Jordan' },
        { name: 'contributor_name', label: 'Contributor name', sample: 'Alex Morgan' },
        { name: 'amount', label: 'Amount', sample: '£150.00' },
        {
          name: 'personal_message',
          label: 'Personal message',
          sample: 'Wishing you both a lifetime of happiness!',
        },
      ],
    },
  ],
}
