'use client'

import { EmailEditor, type EmailEditorProps, type EmailEditorRef } from '@react-email/editor'
import '@react-email/editor/themes/default.css'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { EmailShellOptions, TokenCatalog, TokenDef } from '../types.js'
import { createEmailShell } from '../utilities/emailShell.js'
import { applyTokens } from '../utilities/tokens.js'
import './email-designer.css'

type Device = 'desktop' | 'mobile'

type WorkspaceProps = {
  catalog: TokenCatalog
  shell: EmailShellOptions | false
  templateKey: string | undefined
  subject: string | undefined
  initialContent: EmailEditorProps['content']
  onChange: (next: { json: unknown; html: string; text: string }) => void
}

const identity = (html: string) => html

export function EmailDesignerWorkspace({
  catalog,
  shell,
  templateKey,
  subject,
  initialContent,
  onChange,
}: WorkspaceProps) {
  const keys = Object.keys(catalog)
  const key = templateKey && catalog[templateKey] ? templateKey : (keys[0] ?? '')
  const tokens: TokenDef[] = catalog[key] ?? []

  const wrapEmailHtml = useMemo(
    () => (shell === false ? identity : createEmailShell(shell)),
    [shell],
  )

  const seedValues = useCallback(
    (): Record<string, string> => Object.fromEntries(tokens.map((t) => [t.name, t.sample])),
    [tokens],
  )

  const editorRef = useRef<EmailEditorRef | null>(null)
  const [device, setDevice] = useState<Device>('desktop')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [values, setValues] = useState<Record<string, string>>(seedValues)
  // Keep the latest sample values reachable from the editor's update closure,
  // which is created once at mount and would otherwise see stale values.
  const valuesRef = useRef(values)
  valuesRef.current = values

  const renderPreview = useCallback((html: string, vals: Record<string, string>) => {
    setPreviewHtml(applyTokens(html, vals, true))
  }, [])

  const handleUpdate = useCallback(
    async (ref: EmailEditorRef) => {
      editorRef.current = ref
      const { html, text } = await ref.getEmail()
      const styledHtml = wrapEmailHtml(html)
      onChange({ json: ref.getJSON(), html: styledHtml, text })
      renderPreview(styledHtml, valuesRef.current)
    },
    [onChange, renderPreview, wrapEmailHtml],
  )

  const handleReady = useCallback(
    async (ref: EmailEditorRef) => {
      editorRef.current = ref
      const { html } = await ref.getEmail()
      renderPreview(wrapEmailHtml(html), valuesRef.current)
    },
    [renderPreview, wrapEmailHtml],
  )

  const updateSample = useCallback(
    (name: string, value: string) => {
      const next = { ...valuesRef.current, [name]: value }
      setValues(next)
      editorRef.current?.getEmail().then(({ html }) => renderPreview(wrapEmailHtml(html), next))
    },
    [renderPreview, wrapEmailHtml],
  )

  const insertToken = useCallback((name: string) => {
    const editor = editorRef.current?.editor
    if (!editor) return
    editor.chain().focus().insertContent(`{{${name}}}`).run()
  }, [])

  const subjectPreview = useMemo(
    () => applyTokens(subject ?? '', values, false) || '(no subject)',
    [subject, values],
  )

  return (
    <div className="email-designer">
      {/* Top bar */}
      <header className="email-designer__bar">
        <div className="email-designer__subject">
          <span className="email-designer__subject-label">Subject</span>
          <span className="email-designer__subject-value" title={subjectPreview}>
            {subjectPreview}
          </span>
        </div>
        <div className="email-designer__actions">
          <div className="email-designer__device-toggle">
            <button
              type="button"
              data-active={device === 'desktop'}
              onClick={() => setDevice('desktop')}
            >
              Desktop
            </button>
            <button
              type="button"
              data-active={device === 'mobile'}
              onClick={() => setDevice('mobile')}
            >
              Mobile
            </button>
          </div>
        </div>
      </header>

      {/* Three-pane body */}
      <div className="email-designer__body">
        {/* Left: tokens + sample data */}
        <aside className="email-designer__tokens">
          <h3 className="email-designer__pane-title">Tokens</h3>
          <p className="email-designer__hint">
            Click to insert at the cursor. Edit the sample values to preview real content.
          </p>
          {tokens.length === 0 ? (
            <p className="email-designer__hint">
              Select a template <strong>Key</strong> and save to see its tokens here.
            </p>
          ) : (
            <ul className="email-designer__token-list">
              {tokens.map((token) => (
                <li key={token.name} className="email-designer__token">
                  <button
                    type="button"
                    className="email-designer__token-insert"
                    onClick={() => insertToken(token.name)}
                    title={`Insert {{${token.name}}}`}
                  >
                    <span className="email-designer__token-name">{`{{${token.name}}}`}</span>
                    <span className="email-designer__token-label">{token.label}</span>
                  </button>
                  <input
                    className="email-designer__token-sample"
                    value={values[token.name] ?? ''}
                    onChange={(e) => updateSample(token.name, e.target.value)}
                    placeholder={token.sample}
                    aria-label={`${token.label} sample value`}
                  />
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Center: editor */}
        <section className="email-designer__editor">
          <EmailEditor
            content={initialContent}
            onReady={handleReady}
            onUpdate={handleUpdate}
            placeholder="Press '/' for blocks: headings, buttons, images, columns…"
          />
        </section>

        {/* Right: live preview */}
        <section className="email-designer__preview">
          <h3 className="email-designer__pane-title">Live preview</h3>
          <div className="email-designer__preview-frame" data-device={device}>
            <iframe
              title="Email preview"
              className="email-designer__iframe"
              srcDoc={
                previewHtml || '<p style="font-family:sans-serif;color:#888">Start designing…</p>'
              }
            />
          </div>
        </section>
      </div>
    </div>
  )
}
