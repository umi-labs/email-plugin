import type { Config } from 'payload'
import { createEmailTemplatesCollection } from './collections/EmailTemplates.js'
import { createEmailSettingsGlobal } from './globals/EmailSettings.js'
import type { EmailPluginConfig } from './types.js'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export type {
  EmailPluginConfig,
  EmailTemplateDef,
  EmailShellOptions,
  TokenDef,
  TokenCatalog,
  RenderedEmail,
} from './types.js'

// Server helpers (safe to import in server code / hooks)
export { renderTemplate, type RenderTemplateOptions } from './server/renderTemplate.js'
export { sendEmail, type OutgoingEmail } from './server/send.js'
export { createEmailRenderer } from './server/createEmailRenderer.js'

// Isomorphic utilities
export { applyTokens, formatCurrency, formatPence } from './utilities/tokens.js'
export { createEmailShell, wrapEmailHtml } from './utilities/emailShell.js'
export { shouldSend } from './utilities/shouldSend.js'
export { htmlToText } from './utilities/htmlToText.js'
export { buildTokenCatalog, sampleValues } from './utilities/catalog.js'

// Collection/global factories (for advanced/manual wiring)
export { createEmailTemplatesCollection } from './collections/EmailTemplates.js'
export { createEmailSettingsGlobal } from './globals/EmailSettings.js'

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------
export const emailPlugin =
  (pluginOptions: EmailPluginConfig) =>
  (config: Config): Config => {
    const emailTemplatesSlug = pluginOptions.slugs?.emailTemplates ?? 'email-templates'
    const emailSettingsSlug = pluginOptions.slugs?.emailSettings ?? 'email-settings'
    const adminGroup = pluginOptions.adminGroup ?? 'Email'
    const shell = pluginOptions.shell ?? {}
    const includeSettings = pluginOptions.settingsGlobal !== false

    if (!pluginOptions.templates || pluginOptions.templates.length === 0) {
      throw new Error('[@foundrykit/email-plugin] `templates` must contain at least one template.')
    }

    config.collections = [
      ...(config.collections ?? []),
      createEmailTemplatesCollection({
        slug: emailTemplatesSlug,
        templates: pluginOptions.templates,
        adminGroup,
        shell,
        access: pluginOptions.access,
      }),
    ]

    if (includeSettings) {
      config.globals = [
        ...(config.globals ?? []),
        createEmailSettingsGlobal({
          slug: emailSettingsSlug,
          adminGroup,
          branding: pluginOptions.branding,
        }),
      ]
    }

    // `disabled` still registers the collection/global (so schema/generated
    // types stay stable) but is where any future side effects would be skipped.
    if (pluginOptions.disabled) {
      return config
    }

    return config
  }

export default emailPlugin
