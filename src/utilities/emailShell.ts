import type { EmailShellOptions } from '../types.js'

// The editor's default base template renders content inside a bare, unstyled
// `<body>` (no background, font, width constraint or padding), so emails look
// plain. `wrapEmailHtml` post-processes that full HTML document and drops the
// body content into a styled, email-safe centered card with sensible defaults
// (system font, readable line-height, light page background, rounded white
// container). It is applied to both the live preview and the stored HTML that
// `renderTemplate` sends, so what you design is what recipients receive.

const DEFAULTS: Required<EmailShellOptions> = {
  fontStack: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  pageBackground: '#f4f4f5',
  cardBackground: '#ffffff',
  cardBorder: '#e4e4e7',
  textColor: '#27272a',
  linkColor: '#2563eb',
  maxWidth: 600,
}

const buildStyle = (o: Required<EmailShellOptions>): string => `
    body { margin:0; padding:0; background-color:${o.pageBackground}; -webkit-text-size-adjust:100%; }
    .email-shell__content a { color:${o.linkColor}; }
    .email-shell__content h1 { font-size:28px; line-height:1.25; margin:0 0 16px; font-weight:700; }
    .email-shell__content h2 { font-size:22px; line-height:1.3; margin:0 0 14px; font-weight:700; }
    .email-shell__content h3 { font-size:18px; line-height:1.35; margin:0 0 12px; font-weight:600; }
    .email-shell__content p { margin:0 0 16px; }
    .email-shell__content img { max-width:100%; height:auto; }
    .email-shell__content ul,.email-shell__content ol { margin:0 0 16px; padding-left:24px; }
    @media (max-width:620px) {
      .email-shell__card { width:100% !important; }
      .email-shell__content { padding:24px !important; }
    }`

const buildBody = (inner: string, o: Required<EmailShellOptions>): string =>
  `<body style="margin:0;padding:0;background-color:${o.pageBackground};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${o.pageBackground};width:100%;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" class="email-shell__card" width="${o.maxWidth}" cellpadding="0" cellspacing="0" border="0" style="width:${o.maxWidth}px;max-width:${o.maxWidth}px;background-color:${o.cardBackground};border:1px solid ${o.cardBorder};border-radius:8px;">
            <tr>
              <td class="email-shell__content" style="padding:32px 40px;font-family:${o.fontStack};font-size:16px;line-height:1.6;color:${o.textColor};word-break:break-word;">
${inner}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>`

/**
 * Create a shell wrapper bound to the given styling options. The returned
 * function wraps a full HTML email document (as produced by the editor) in a
 * styled, email-safe centered card. It is idempotent and safe on empty input.
 */
export const createEmailShell = (options: EmailShellOptions = {}) => {
  const o = { ...DEFAULTS, ...options }
  const style = buildStyle(o)

  return function wrapEmailHtml(fullHtml: string): string {
    if (!fullHtml?.trim()) return fullHtml

    // Already wrapped — don't double-wrap (idempotent).
    if (fullHtml.includes('email-shell__card')) return fullHtml

    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    const inner = bodyMatch ? bodyMatch[1] : fullHtml
    const styledBody = buildBody(inner, o)

    if (!bodyMatch) {
      // No <body> (a fragment) — return a minimal styled document.
      return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width"><style>${style}</style></head>${styledBody}</html>`
    }

    let out = fullHtml.replace(/<body[^>]*>[\s\S]*?<\/body>/i, styledBody)

    if (/<\/head>/i.test(out)) {
      out = out.replace(/<\/head>/i, `<style>${style}</style></head>`)
    }

    return out
  }
}

/** Default shell wrapper using the built-in styling. */
export const wrapEmailHtml = createEmailShell()
