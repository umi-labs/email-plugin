import type { Payload } from 'payload'
import type { EmailShellOptions, EmailTemplateDef, RenderedEmail } from '../types.js'
import { createEmailShell } from '../utilities/emailShell.js'
import { htmlToText } from '../utilities/htmlToText.js'
import { applyTokens } from '../utilities/tokens.js'

export type RenderTemplateOptions = {
  /** Templates collection slug. Default `email-templates`. */
  collectionSlug?: string
  /** Template definitions (for default subject + fallback HTML). */
  templates?: EmailTemplateDef[]
  /** Shell styling, or `false` to leave fallback HTML unwrapped. */
  shell?: EmailShellOptions | false
}

/**
 * Look up the stored template for `key`, substitute `{{tokens}}` and return a
 * ready-to-send `{ subject, html, text }`.
 *
 * Precedence for the body:
 *   1. the visual design saved in the admin (`design.html`), else
 *   2. the template def's `fallbackHtml` (shell-wrapped here), else
 *   3. a minimal shell-wrapped empty body.
 *
 * Unknown/typo tokens are left visible rather than silently blanked.
 */
export const renderTemplate = async (
  payload: Payload,
  key: string,
  values: Record<string, string>,
  options: RenderTemplateOptions = {},
): Promise<RenderedEmail> => {
  const collectionSlug = options.collectionSlug ?? 'email-templates'
  const def = options.templates?.find((t) => t.key === key)
  const wrap =
    options.shell === false ? (html: string) => html : createEmailShell(options.shell ?? {})

  const result = await payload.find({
    collection: collectionSlug,
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const template = result.docs[0] as
    | { subject?: string; design?: { html?: string; text?: string } }
    | undefined

  const subject =
    applyTokens(template?.subject ?? '', values, false) ||
    applyTokens(def?.defaultSubject ?? '', values, false)

  // 1. Saved visual design (already shell-wrapped at save time).
  if (template?.design?.html) {
    const html = applyTokens(template.design.html, values, true)
    const text = template.design.text
      ? applyTokens(template.design.text, values, false)
      : htmlToText(html)
    return { subject, html, text }
  }

  // 2/3. Fallback.
  const fallback = def?.fallbackHtml ?? '<p></p>'
  const html = applyTokens(wrap(fallback), values, true)
  const text = htmlToText(html)
  return { subject, html, text }
}
