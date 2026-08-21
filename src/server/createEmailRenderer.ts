import type { Payload } from 'payload'
import type { EmailPluginConfig, RenderedEmail } from '../types.js'
import { renderTemplate as renderTemplateBase } from './renderTemplate.js'
import { sendEmail } from './send.js'

/**
 * Build render/send helpers pre-bound to your plugin config, so app code never
 * repeats the collection slug / shell options.
 *
 * ```ts
 * export const email = createEmailRenderer(emailConfig)
 * // later, in a hook:
 * await email.sendTemplate(payload, {
 *   key: 'guest-confirmation',
 *   to: guest.email,
 *   values: { first_name: 'Sam', amount: '£150.00' },
 * })
 * ```
 */
export const createEmailRenderer = (config: EmailPluginConfig) => {
  const collectionSlug = config.slugs?.emailTemplates ?? 'email-templates'
  const shell = config.shell ?? {}
  const templates = config.templates

  const renderTemplate = (
    payload: Payload,
    key: string,
    values: Record<string, string>,
  ): Promise<RenderedEmail> =>
    renderTemplateBase(payload, key, values, { collectionSlug, templates, shell })

  const sendTemplate = async (
    payload: Payload,
    args: { key: string; to: string; values: Record<string, string>; from?: string },
  ): Promise<RenderedEmail> => {
    const rendered = await renderTemplate(payload, args.key, args.values)
    await sendEmail(payload, { to: args.to, from: args.from, ...rendered })
    return rendered
  }

  return { renderTemplate, sendTemplate }
}
