const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (c) => ESCAPE_MAP[c] ?? c)

/**
 * Format an integer amount of minor currency units (e.g. pence) as a localized
 * currency string. Defaults to GBP / en-GB to match the original Turquoise
 * behaviour; pass `currency`/`locale` for other markets.
 */
export const formatCurrency = (
  minorUnits: number,
  currency = 'GBP',
  locale = 'en-GB',
): string => (minorUnits / 100).toLocaleString(locale, { style: 'currency', currency })

/** Back-compat alias for GBP pence formatting. */
export const formatPence = (pence: number): string => formatCurrency(pence, 'GBP', 'en-GB')

/**
 * Replaces `{{token}}` occurrences with values. Unknown tokens are left intact
 * so typos stay visible. Values are HTML-escaped unless `escapeValues=false`
 * (used for the plain-text part and for subject lines).
 */
export const applyTokens = (
  template: string,
  values: Record<string, string>,
  escapeValues = true,
): string =>
  template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (!(key in values)) return match
    const value = values[key] ?? ''
    return escapeValues ? escapeHtml(value) : value
  })
