/**
 * Very small HTML → plain-text fallback used only when a template has no
 * designer-produced text part. Not a full converter — it strips tags, decodes
 * a handful of common entities and collapses whitespace, which is enough for a
 * readable multipart text alternative.
 */
export const htmlToText = (html: string): string => {
  if (!html) return ''
  return html
    .replace(/<\s*(br|\/p|\/div|\/h[1-6]|\/li)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
