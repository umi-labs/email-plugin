import type { Access } from 'payload'

/**
 * A single `{{token}}` that can be inserted into a template and substituted at
 * send time. `sample` drives the designer's live preview so editors see
 * realistic content while designing.
 */
export type TokenDef = {
  /** Token name without braces, e.g. `first_name` → `{{first_name}}`. */
  name: string
  /** Human label shown next to the token in the designer palette. */
  label: string
  /** Sample value used for the live preview. */
  sample: string
}

/**
 * Declares one email template the plugin manages. Each becomes a selectable
 * `key` on the `email-templates` collection, and its `tokens` populate the
 * designer palette when that key is selected.
 */
export type EmailTemplateDef = {
  /** Unique key used to look the template up at send time. */
  key: string
  /** Label shown in the admin `key` dropdown. */
  label: string
  /** Default subject used when a document has none. Supports `{{tokens}}`. */
  defaultSubject?: string
  /** Tokens available to this template. */
  tokens: TokenDef[]
  /**
   * Optional fallback HTML (supports `{{tokens}}`) used by `renderTemplate`
   * when a document has no visual design saved yet. Wrapped in the email shell
   * automatically. If omitted, a minimal shell-wrapped body is used.
   */
  fallbackHtml?: string
}

/**
 * Styling for the email "shell" — the email-safe centered card the designer
 * output is dropped into. Set to `false` on the plugin to disable wrapping.
 */
export type EmailShellOptions = {
  fontStack?: string
  pageBackground?: string
  cardBackground?: string
  cardBorder?: string
  textColor?: string
  linkColor?: string
  /** Card width in px. Default 600. */
  maxWidth?: number
}

export type EmailPluginConfig = {
  /** The templates this plugin manages. */
  templates: EmailTemplateDef[]
  /** Override collection/global slugs. */
  slugs?: {
    /** Default `email-templates`. */
    emailTemplates?: string
    /** Default `email-settings`. Set `settingsGlobal: false` to omit the global. */
    emailSettings?: string
  }
  /** Admin sidebar group for the collection + global. Default `Email`. */
  adminGroup?: string
  /** Read/write access control for the templates collection. Defaults to authenticated. */
  access?: {
    read?: Access
    create?: Access
    update?: Access
    delete?: Access
  }
  /** Add an `email-settings` global (from-name/email, reply-to, support). Default true. */
  settingsGlobal?: boolean
  /** Default sender identity seeded onto the settings global. */
  branding?: {
    fromName?: string
    fromEmail?: string
    replyTo?: string
    supportContact?: string
  }
  /** Email shell styling, or `false` to send the designer HTML unwrapped. */
  shell?: EmailShellOptions | false
  /** Register the collection/global but skip any side effects. */
  disabled?: boolean
}

/** Fully-resolved config used internally after defaults are applied. */
export type ResolvedEmailConfig = Required<
  Pick<EmailPluginConfig, 'templates' | 'adminGroup'>
> & {
  emailTemplatesSlug: string
  emailSettingsSlug: string
  shell: EmailShellOptions | false
}

/** Serializable catalog passed to the client designer via `clientProps`. */
export type TokenCatalog = Record<string, TokenDef[]>

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}
