import type { CollectionConfig } from 'payload'
import type { EmailPluginConfig, EmailShellOptions, EmailTemplateDef } from '../types.js'
import { buildTokenCatalog } from '../utilities/catalog.js'

const authenticated = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

export type CreateEmailTemplatesArgs = {
  slug: string
  templates: EmailTemplateDef[]
  adminGroup: string
  shell: EmailShellOptions | false
  access?: EmailPluginConfig['access']
}

/**
 * Factory for the `email-templates` collection. Each configured template
 * becomes a selectable `key`; the `design` group holds the editor JSON plus the
 * serialised HTML/text produced by the visual designer.
 */
export const createEmailTemplatesCollection = ({
  slug,
  templates,
  adminGroup,
  shell,
  access,
}: CreateEmailTemplatesArgs): CollectionConfig => {
  const catalog = buildTokenCatalog(templates)

  return {
    slug,
    access: {
      create: access?.create ?? authenticated,
      delete: access?.delete ?? authenticated,
      read: access?.read ?? authenticated,
      update: access?.update ?? authenticated,
    },
    admin: {
      group: adminGroup,
      defaultColumns: ['key', 'subject', 'updatedAt'],
      useAsTitle: 'key',
    },
    labels: {
      singular: 'Email Template',
      plural: 'Email Templates',
    },
    fields: [
      {
        name: 'key',
        type: 'select',
        required: true,
        unique: true,
        admin: { description: 'Which transactional email this document defines.' },
        options: templates.map((t) => ({ label: t.label, value: t.key })),
      },
      {
        name: 'subject',
        type: 'text',
        required: true,
        admin: {
          description:
            'Supports {{tokens}} — see the token palette in the designer for what is available.',
        },
      },
      {
        name: 'preview',
        type: 'text',
        admin: { description: 'Inbox preview line (optional).' },
      },
      {
        name: 'design',
        type: 'group',
        label: 'Design',
        fields: [
          {
            name: 'json',
            type: 'json',
            label: 'Email design',
            admin: {
              description: 'Managed by the visual email designer.',
              components: {
                Field: {
                  path: '@foundrykit/email-plugin/client#EmailDesignerField',
                  clientProps: { catalog, shell },
                },
              },
            },
          },
          { name: 'html', type: 'textarea', admin: { readOnly: true, hidden: true } },
          { name: 'text', type: 'textarea', admin: { readOnly: true, hidden: true } },
        ],
      },
    ],
  }
}
