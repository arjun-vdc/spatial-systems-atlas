// The row panel — the answer to the "matrix inside a matrix" question.
//
// Clicking any cell opens the ROW, not the cell: one capability across every
// compared subject, banded by support level. Each subject expands in place to
// show its note and its sources. Depth comes from expanding, never from a
// second grid.

import { useEffect, useRef, useState } from 'react'
import type { Level, Model } from '../design-model.ts'
import { levelOf } from '../design-model.ts'
import { read } from './marks.ts'
import type { AppState } from './state.ts'

/** Bands in the order the design fixed: strongest support first, unknown last. */
const BANDS: Array<{ level: Level | null; heading: string }> = [
  { level: 'n', heading: 'Built in' },
  { level: 'x', heading: 'Through an extension' },
  { level: 'p', heading: 'Partial' },
  { level: 'c', heading: 'Conflict' },
  { level: 'z', heading: 'Absent' },
  { level: 'o', heading: 'Out of scope' },
  { level: null, heading: 'Not assessed' },
]

export function RowPanel({ model, state, onClose }: {
  model: Model
  state: AppState
  onClose: () => void
}) {
  const target = state.detail!
  const capability = model.byCapability.get(target.cid)
  const [expanded, setExpanded] = useState<string | null>(target.sid)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus moves into the panel when it opens, so the keyboard follows the eye.
  useEffect(() => { closeRef.current?.focus() }, [])

  if (!capability) return null

  const subjects = state.on.length ? state.on : model.subjects.map((s) => s.id)
  const focusCode = state.focus ? model.cov[state.focus]?.[capability.id] : undefined
  const focusName = state.focus ? model.bySubject.get(state.focus)?.name : null

  // The derived reading for the subject in focus. Everything below comes from
  // the claims in this one row: no new data, no scoring, no recommendation.
  const peers = subjects.filter((id) => id !== state.focus)
  const level = levelOf(focusCode)
  const follow = peers.filter((id) => {
    const code = model.cov[id]?.[capability.id]
    return levelOf(code) === 'n' && code?.[1] === 'v'
  })
  const resolve = peers.filter((id) => levelOf(model.cov[id]?.[capability.id]) === 'c')
  const blocked = peers.filter((id) => levelOf(model.cov[id]?.[capability.id]) === 'z')

  const name = (id: string) => model.bySubject.get(id)?.name ?? id

  return (
    <div style={s.scrim} onClick={onClose} role="presentation">
      <aside style={s.panel} className="claim-detail" role="dialog" aria-label={`${capability.name} across every compared subject`}
        onClick={(e) => e.stopPropagation()}>
        <header style={s.head}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={s.eyebrow}>
              {model.groups.find((g) => g.id === capability.g)?.name ?? capability.g}
              {capability.interop === 'must' && ' · must interoperate'}
            </span>
            <h2 style={s.title}>{capability.name}</h2>
          </div>
          <button ref={closeRef} type="button" style={s.close} onClick={onClose}
            title="Close this row (Escape)">Close</button>
        </header>

        <p style={s.definition}>{capability.def}</p>
        <p style={s.binding}>
          {capability.bind === 'connect'
            ? 'Agreed between two systems when they connect.'
            : 'Fixed when the content is made.'}
          {capability.why ? ` ${capability.why}` : ''}
        </p>

        {state.focus && (
          <section style={s.reading}>
            <span style={s.eyebrow}>For {focusName}</span>
            <p style={{ margin: '4px 0 8px' }}>
              <strong>{read(focusCode).word}</strong>
              {read(focusCode).confidence ? ` — ${read(focusCode).confidence}` : ''}.
              {' '}
              {level === 'n' || level === 'x'
                ? `${follow.length} of the ${peers.length} others reach it with verified evidence.`
                : `${follow.length} of the ${peers.length} others have it built in with verified evidence.`}
            </p>
            <Actions label="Follow" note="built in, with primary evidence read" ids={follow} name={name} />
            <Actions label="Resolve" note="a conflict is recorded against this row" ids={resolve} name={name} />
            <Actions label="Blocked by" note="recorded as absent" ids={blocked} name={name} />
          </section>
        )}

        <div style={{ overflowY: 'auto', minHeight: 0 }}>
          {BANDS.map((band) => {
            const members = subjects.filter(
              (id) => levelOf(model.cov[id]?.[capability.id]) === band.level,
            )
            if (members.length === 0) return null
            return (
              <section key={band.heading}>
                <h3 style={s.bandHead}>{band.heading} <span style={s.bandCount}>{members.length}</span></h3>
                {members.map((id) => {
                  const code = model.cov[id]?.[capability.id]
                  const detail = model.det[id]?.[capability.id]
                  const open = expanded === id
                  const reading = read(code)
                  return (
                    <div key={id} style={s.subjectRow(id === state.focus)}>
                      <button type="button" style={s.subjectButton} aria-expanded={open}
                        onClick={() => setExpanded(open ? null : id)}>
                        <span style={{ width: 12 }}>{open ? '▾' : '▸'}</span>
                        <span style={{ flex: 1, textAlign: 'left', fontFamily: 'var(--fl)', fontWeight: 600 }}>
                          {name(id)}
                        </span>
                        {reading.confidence && <span style={s.conf}>{reading.confidence}</span>}
                      </button>
                      {open && (
                        model.detLoaded ? (
                          <div style={{ padding: '4px 0 8px 22px' }}>
                            {detail?.[0]
                              ? <p style={{ margin: '0 0 6px' }}>{detail[0]}</p>
                              : <p style={s.quiet}>No note was recorded against this claim.</p>}
                            <span style={s.eyebrow}>Evidence</span>
                            {detail?.[1]?.length
                              ? detail[1].map((src, i) => (
                                  <div key={i} style={s.source}>
                                    {src[0]
                                      ? <a href={src[0]} target="_blank" rel="noreferrer">{src[1]}</a>
                                      : <span>{src[1]}</span>}
                                    <span style={s.kind}>{src[2]}</span>
                                    {src[3] && <p style={s.excerpt}>"{src[3]}"</p>}
                                  </div>
                                ))
                              : <p style={s.quiet}>No source is attached to this claim.</p>}
                          </div>
                        ) : (
                          <div style={{ padding: '4px 0 8px 22px' }}>
                            <p style={s.quiet}>Notes and evidence are still arriving.</p>
                          </div>
                        )
                      )}
                    </div>
                  )
                })}
              </section>
            )
          })}
        </div>
      </aside>
    </div>
  )
}

function Actions({ label, note, ids, name }: { label: string; note: string; ids: string[]; name: (id: string) => string }) {
  if (ids.length === 0) return null
  return (
    <p style={{ margin: '0 0 4px', fontSize: 12 }}>
      <strong style={{ fontFamily: 'var(--fl)' }}>{label}</strong>
      <span style={{ color: 'var(--faint)' }}> — {note}: </span>
      {ids.map(name).join(', ')}
    </p>
  )
}

const s = {
  scrim: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.28)', zIndex: 60, display: 'flex', justifyContent: 'flex-end' } as const,
  panel: { width: 'min(460px,100%)', background: 'var(--panel)', borderLeft: '1px solid var(--ruleS)', display: 'flex', flexDirection: 'column', padding: '14px 16px', gap: 4, overflow: 'hidden' } as const,
  head: { display: 'flex', gap: 12, alignItems: 'flex-start' } as const,
  eyebrow: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  title: { margin: '2px 0 6px', fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 19 } as const,
  close: { fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 11, background: 'transparent', border: '1px solid var(--rule)', borderRadius: 'var(--r)', padding: '3px 9px', cursor: 'pointer' } as const,
  definition: { margin: '0 0 6px', color: 'var(--soft)' } as const,
  binding: { margin: '0 0 10px', fontSize: 12, color: 'var(--faint)', fontStyle: 'italic' } as const,
  reading: { border: '1px solid var(--rule)', borderRadius: 'var(--r)', padding: '8px 10px', marginBottom: 10, background: 'var(--bg)' } as const,
  bandHead: { margin: '10px 0 4px', fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', borderBottom: '1px solid var(--rule)', paddingBottom: 3 } as const,
  bandCount: { fontFamily: 'var(--fm)', color: 'var(--faint)', marginLeft: 4 } as const,
  subjectRow: (isFocus: boolean) => ({ borderLeft: isFocus ? '2px solid var(--ac)' : '2px solid transparent', paddingLeft: 6 } as const),
  subjectButton: { display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'transparent', border: 0, padding: '4px 0', cursor: 'pointer', fontSize: 12.5, color: 'var(--ink)' } as const,
  conf: { fontFamily: 'var(--fm)', fontSize: 9.5, color: 'var(--faint)' } as const,
  quiet: { margin: '0 0 6px', fontSize: 12, color: 'var(--faint)', fontStyle: 'italic' } as const,
  source: { marginTop: 4, fontSize: 12 } as const,
  kind: { fontFamily: 'var(--fm)', fontSize: 9.5, color: 'var(--faint)', marginLeft: 6 } as const,
  excerpt: { margin: '2px 0 0', fontSize: 11.5, color: 'var(--soft)', fontStyle: 'italic' } as const,
}
