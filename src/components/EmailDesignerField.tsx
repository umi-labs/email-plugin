'use client'

import { Drawer, FieldLabel, useDrawerSlug, useField, useModal } from '@payloadcms/ui'
import type { EmailEditorProps } from '@react-email/editor'
import type { JSONFieldClientProps } from 'payload'
import { useCallback } from 'react'
import type { EmailShellOptions, TokenCatalog } from '../types.js'
import { EmailDesignerWorkspace } from './EmailDesignerWorkspace.js'
import './email-designer.css'

type EmailDesignerFieldProps = JSONFieldClientProps & {
  /** Token catalog keyed by template key, injected via `clientProps`. */
  catalog: TokenCatalog
  /** Email shell options (or false), injected via `clientProps`. */
  shell: EmailShellOptions | false
}

/**
 * Custom Field for `design.json`. Rather than cram the editor inline, it shows
 * a summary + a button that opens a Payload Drawer containing the designer
 * (editor + token palette + live preview). On change it writes the editor JSON
 * to `design.json` and the serialised `design.html`/`design.text` siblings so
 * `renderTemplate` can use them at send time.
 */
export const EmailDesignerField = ({ field, path, catalog, shell }: EmailDesignerFieldProps) => {
  const jsonPath = path || field.name
  const basePath = jsonPath.split('.').slice(0, -1).join('.')

  const { value: jsonValue, setValue: setJson } = useField<EmailEditorProps['content']>({
    path: jsonPath,
  })
  const { value: htmlValue, setValue: setHtml } = useField<string>({ path: `${basePath}.html` })
  const { setValue: setText } = useField<string>({ path: `${basePath}.text` })

  // Sibling fields used to scope the designer (tokens + subject preview).
  const { value: keyValue } = useField<string>({ path: 'key' })
  const { value: subjectValue } = useField<string>({ path: 'subject' })

  const { openModal } = useModal()
  const drawerSlug = useDrawerSlug('email-designer')
  const isOpen = useModal().modalState[drawerSlug]?.isOpen ?? false

  const handleChange = useCallback(
    (next: { json: unknown; html: string; text: string }) => {
      setJson(next.json as EmailEditorProps['content'])
      setHtml(next.html)
      setText(next.text)
    },
    [setJson, setHtml, setText],
  )

  const isDesigned = Boolean(htmlValue && htmlValue.trim().length > 0)

  // The workspace (and its editor) only mounts while the drawer is open, so it
  // re-seeds from the latest saved JSON every time it is reopened.
  const initialContent = (jsonValue ?? undefined) as EmailEditorProps['content']

  return (
    <div className="field-type">
      <FieldLabel htmlFor={`field-${jsonPath}`} label={field?.label} />

      <div className="email-designer-trigger">
        <button
          type="button"
          className="btn btn--style-primary btn--size-small"
          onClick={() => openModal(drawerSlug)}
        >
          {isDesigned ? 'Edit email design' : 'Open Email Designer'}
        </button>
        <span className="email-designer-summary">
          {isDesigned
            ? 'A custom design is set. Click to edit, preview and insert tokens.'
            : 'No design yet — build one with the visual editor and live preview.'}
        </span>
      </div>

      <Drawer
        slug={drawerSlug}
        title="Email Designer"
        gutter={false}
        className="email-designer-drawer"
      >
        {isOpen && (
          <EmailDesignerWorkspace
            catalog={catalog}
            shell={shell}
            templateKey={keyValue}
            subject={subjectValue}
            initialContent={initialContent}
            onChange={handleChange}
          />
        )}
      </Drawer>
    </div>
  )
}
