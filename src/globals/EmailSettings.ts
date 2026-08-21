import type { GlobalConfig } from 'payload'
import type { EmailPluginConfig } from '../types.js'

export type CreateEmailSettingsArgs = {
  slug: string
  adminGroup: string
  branding?: EmailPluginConfig['branding']
}

/**
 * Factory for the `email-settings` global — the sender identity and support
 * contact editors can manage without a code change. Read access is public so
 * the frontend/emails can reference it; writing is left to your collection
 * access defaults via the admin panel.
 */
export const createEmailSettingsGlobal = ({
  slug,
  adminGroup,
  branding,
}: CreateEmailSettingsArgs): GlobalConfig => ({
  slug,
  label: 'Email Settings',
  access: { read: () => true },
  admin: { group: adminGroup },
  fields: [
    {
      name: 'fromName',
      type: 'text',
      defaultValue: branding?.fromName,
      admin: { description: 'Display name shown as the sender.' },
    },
    {
      name: 'fromEmail',
      type: 'text',
      defaultValue: branding?.fromEmail,
      admin: { description: 'Address emails are sent from.' },
    },
    {
      name: 'replyTo',
      type: 'text',
      defaultValue: branding?.replyTo,
      admin: { description: 'Where replies should go (optional).' },
    },
    {
      name: 'supportContact',
      type: 'text',
      defaultValue: branding?.supportContact,
      admin: { description: 'Support address/phone surfaced in emails (optional).' },
    },
  ],
})
