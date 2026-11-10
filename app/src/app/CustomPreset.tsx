import { useState } from 'react'
import type { CSSProperties, Dispatch } from 'react'
import type { Model } from '../design-model.ts'
import type { Action, AppState } from './state.ts'
import { encode } from './state.ts'
import { assessedSubjects, normalizeCustomPreset, PRESET_DETAILS_LIMIT, PRESET_TITLE_LIMIT } from './custom-preset.ts'

/** A custom preset is the current analysis, named and carried entirely in its link. */
export function CustomPreset({ model, state, dispatch }: {
  model: Model; state: AppState; dispatch: Dispatch<Action>
}) {
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState('')
  const custom = state.customPreset
  const link = `${window.location.origin}${window.location.pathname}#${encode(state, model.subjects.length)}`

  return (
    <div style={{ borderTop: '1px solid var(--rule)', marginTop: 10, paddingTop: 10 }}>
      {custom && <p style={{ ...S.note, overflowWrap: 'anywhere', marginBottom: 8 }}>
        <strong>{custom.title}</strong>{custom.details && <><br />{custom.details}</>}
      </p>}
      {editing ? <PresetForm key={custom?.title ?? ''} model={model} state={state}
        cancel={() => setEditing(false)} save={(title, details, on) => {
          dispatch({ type: 'custom-preset', title, details, on })
          setEditing(false)
          setNote('Preset created. Copy its link to keep or share it.')
        }} /> : <button type="button" style={S.button} onClick={() => { setEditing(true); setNote('') }}>
        {custom ? 'Edit custom preset' : 'Create custom preset'}
      </button>}
      {custom && !editing && <div style={{ marginTop: 8 }}>
        <label style={S.label}>Share link
          <input style={S.input} readOnly value={link} onFocus={(e) => e.target.select()} />
        </label>
        <button type="button" style={{ ...S.button, marginTop: 6 }} onClick={async () => {
          try {
            await navigator.clipboard.writeText(link)
            setNote('Link copied.')
          } catch {
            setNote('Copy the link from the field above.')
          }
        }}>Copy preset link</button>
        {note && <p role="status" style={S.note}>{note}</p>}
      </div>}
    </div>
  )
}

function PresetForm({ model, state, cancel, save }: {
  model: Model; state: AppState; cancel: () => void
  save: (title: string, details: string, on?: string[]) => void
}) {
  const [title, setTitle] = useState(state.customPreset?.title ?? '')
  const [details, setDetails] = useState(state.customPreset?.details ?? '')
  const [assessed, setAssessed] = useState(false)
  const [error, setError] = useState('')
  const eligible = assessedSubjects(model, state.sel)
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const custom = normalizeCustomPreset(title, details)
      if (!custom) { setError('Enter a title for this preset.'); return }
      save(custom.title, custom.details, assessed ? eligible : undefined)
    }} style={{ display: 'grid', gap: 8 }}>
      <p style={S.note}>Name this view and share its subjects, capabilities and counting rules.</p>
      <label style={S.label}>Title ({PRESET_TITLE_LIMIT} characters maximum)
        <input style={S.input} value={title} maxLength={PRESET_TITLE_LIMIT} required
          onChange={(e) => setTitle(e.target.value)} autoFocus />
      </label>
      <label style={S.label}>Details ({PRESET_DETAILS_LIMIT} characters maximum)
        <textarea style={{ ...S.input, resize: 'vertical' }} rows={3} value={details}
          maxLength={PRESET_DETAILS_LIMIT} onChange={(e) => setDetails(e.target.value)} />
      </label>
      <label style={{ ...S.label, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <input type="checkbox" checked={assessed} onChange={(e) => setAssessed(e.target.checked)} />
        <span>Select all {eligible.length} subjects assessed for at least one {state.sel.length ? 'picked' : 'listed'} capability</span>
      </label>
      <p style={S.note}>Includes recorded absence and unverified claims. Excludes subjects with only out-of-scope or unassessed cells.</p>
      <p style={S.note}>Title and details are visible to anyone with the link.</p>
      {error && <p role="alert" style={S.note}>{error}</p>}
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="submit" style={S.button}>Create share link</button>
        <button type="button" style={S.button} onClick={cancel}>Cancel</button>
      </div>
    </form>
  )
}

const S: Record<string, CSSProperties> = {
  label: { display: 'grid', gap: 4, fontFamily: 'var(--fl)', fontSize: 12, color: 'var(--ink)' },
  input: { width: '100%', minWidth: 0, boxSizing: 'border-box', fontFamily: 'var(--fl)', fontSize: 16,
    background: 'var(--bg)', border: '1px solid var(--ruleS)', borderRadius: 'var(--r)', padding: '5px 8px', color: 'var(--ink)' },
  button: { fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 12, background: 'transparent',
    color: 'var(--ink)', border: '1px solid var(--ruleS)', borderRadius: 'var(--r)', padding: '6px 8px', cursor: 'pointer' },
  note: { margin: 0, fontSize: 12, color: 'var(--soft)' },
}
