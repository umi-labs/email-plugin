import type { EmailTemplateDef, TokenCatalog } from '../types.js'

/** Build a serializable `{ key: tokens[] }` map for the designer's `clientProps`. */
export const buildTokenCatalog = (templates: EmailTemplateDef[]): TokenCatalog =>
  Object.fromEntries(templates.map((t) => [t.key, t.tokens]))

/** Sample-value map for a template key, used to seed the live preview. */
export const sampleValues = (
  templates: EmailTemplateDef[],
  key: string,
): Record<string, string> => {
  const tokens = templates.find((t) => t.key === key)?.tokens ?? []
  return Object.fromEntries(tokens.map((t) => [t.name, t.sample]))
}
