// The landing display: one subject in the foreground, everything else selected
// standing beside it.
//
// The comparison IS the selection. There is no separate comparison list, and
// removing a chip here removes the subject from the selection.

import { useLayoutEffect, useRef, useState } from 'react'
import type { Capability, Model } from '../design-model.ts'
import { inLane, levelOf, scopeNote, subjectKindLine } from '../design-model.ts'
import { collapsedCount } from './layout.ts'
import type { Collapse } from './layout.ts'
import { cellStyle, describe, read } from './marks.ts'
import type { Action, AppState } from './state.ts'

/**
 * Reach, built in, assessed and conflicts, each with one definition. They are
 * figures to read, not controls: the click-to-filter behaviour was withdrawn in
 * November 2026 because readers found it confusing.
 */
const HERO_STATS = [
  { key: 'reach', label: 'rows reached', colour: 'var(--ac)' },
  { key: 'native', label: 'built in', colour: 'var(--ink)' },
  { key: 'assessed', label: 'assessed', colour: 'var(--soft)' },
  { key: 'conflicts', label: 'conflicts', colour: 'var(--bad)' },
] as const

export function SubjectView({ model, state, dispatch, rows }: {
  model: Model
  state: AppState
  dispatch: React.Dispatch<Action>
  rows: Capability[]
}) {
  const focus = state.focus ? model.bySubject.get(state.focus) : undefined
  if (!focus) return null

  const cov = model.cov[focus.id] ?? {}
  const scope = scopeNote(model, focus.id)
  const peers = state.on.filter((id) => id !== focus.id)
  const columns = [focus.id, ...peers.slice(0, 7)]

  // The figures count every row, whatever the row filters show below them.
  const total = model.capabilities.length
  const value = (key: (typeof HERO_STATS)[number]['key']): string =>
    key === 'assessed' ? `${total - focus.never}/${total}` : String(focus[key])

  const readouts = buildReadouts(model, state, rows)

  return (
    <div>
      <section style={s.hero}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <span style={s.eyebrow}>
            {subjectKindLine(model, focus)} · {focus.org ?? 'no organisation recorded'}
          </span>
          <h2 style={s.name}>{focus.name}</h2>
          <span style={s.facts}>
            {[focus.status, focus.version ? `v${focus.version}` : null, focus.licence].filter(Boolean).join(' · ')}
          </span>
          {focus.sum && <p style={s.summary}>{focus.sum}</p>}
          {scope && (
            <p style={s.scope}>
              {scope.outOfScope} of the {scope.total} rows do not apply to this kind of subject and are
              scored out of scope. The figures beside this describe the {scope.applies} that do.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }} role="group" aria-label={`${focus.name} in figures`}>
          {HERO_STATS.map((stat) => (
            <div key={stat.key} style={s.stat} data-stat={stat.key}>
              <span style={{ ...s.statNumber, color: stat.colour }}>{value(stat.key)}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <ComparedWith model={model} peers={peers} dispatch={dispatch} />

      <section style={s.panel}>
        <div style={s.panelHead}>
          <span style={s.eyebrow}>Coverage by group</span>
          <span style={s.hint}>breadth first · open a group for the rows</span>
        </div>
        {model.groups.map((group) => {
          const groupRows = rows.filter((c) => c.g === group.id)
          const allRows = model.capabilities.filter((c) => c.g === group.id)
          if (groupRows.length === 0) return null
          const open = !!state.openGroups[group.id]
          return (
            <div key={group.id}>
              <button type="button" style={s.groupRow} aria-expanded={open}
                onClick={() => dispatch({ type: 'toggle-group', id: group.id })}>
                <span style={{ width: 12 }}>{open ? '▾' : '▸'}</span>
                <span style={{ flex: '1 1 160px', minWidth: 0, textAlign: 'left', fontFamily: 'var(--fl)', fontWeight: 600 }}>
                  {group.name}
                </span>
                <Breadth model={model} subjectId={focus.id} capabilities={allRows} />
                <span style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--faint)', flex: '0 0 56px', textAlign: 'right' }}>
                  {allRows.filter((c) => ['n', 'x', 'p'].includes(levelOf(cov[c.id]) ?? '')).length}/{allRows.length}
                </span>
              </button>

              {open && groupRows.map((c) => (
                <div key={c.id} style={s.capRow}>
                  <button type="button" style={s.capName}
                    title="Open this whole row, across every compared subject"
                    onClick={() => dispatch({ type: 'detail', detail: { cid: c.id, sid: focus.id } })}>
                    {c.name}
                    {c.interop === 'must' && <span style={s.must}>must</span>}
                    {state.lane && inLane(c, state.lane) && <span style={s.lane}>lane</span>}
                  </button>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {columns.map((sid) => {
                      const code = model.cov[sid]?.[c.id]
                      const subject = model.bySubject.get(sid)
                      return (
                        <button key={sid} type="button"
                          style={{ ...cellStyle(code, 22), height: 22, padding: '0 6px', justifyContent: 'flex-start' }}
                          title={describe(code, subject?.name ?? sid, c.name)}
                          onClick={() => dispatch({ type: 'detail', detail: { cid: c.id, sid } })}>
                          <span style={{ maxWidth: '13ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {subject?.name ?? sid}
                          </span>
                          <span style={{ marginLeft: 3 }}>{read(code).glyph}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </section>

      <div style={s.readouts}>
        {readouts.map((r) => (
          <section key={r.title} style={s.readout}>
            <div style={s.panelHead}>
              <span style={s.eyebrow}>{r.title}</span>
              <strong style={{ fontFamily: 'var(--fm)', fontSize: 16 }}>{r.items.length}</strong>
            </div>
            <p style={s.hint}>{r.sub}</p>
            {r.items.length === 0 ? (
              <p style={{ ...s.hint, fontStyle: 'italic' }}>Nothing here.</p>
            ) : r.items.slice(0, 12).map((item) => (
              <button key={item.cid} type="button" style={s.readoutRow}
                onClick={() => dispatch({ type: 'detail', detail: { cid: item.cid, sid: item.sid } })}>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
                <span style={{ color: item.colour, fontFamily: 'var(--fm)', fontSize: 10 }}>{item.tag}</span>
              </button>
            ))}
            {r.items.length > 12 && (
              <span style={s.hint}>and {r.items.length - 12} more</span>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

/**
 * The subjects beside the one in focus, as chips that remove themselves from the
 * comparison. A long list shows its first two rows and a Show more / Hide more
 * button; a list that fits on two rows has no button. Collapsing only hides
 * chips: the selection is untouched.
 *
 * The rows are measured from an invisible copy of the whole list, laid out at the
 * same width, so the visible list never has to render everything to decide.
 */
function ComparedWith({ model, peers, dispatch }: {
  model: Model
  peers: string[]
  dispatch: React.Dispatch<Action>
}) {
  const [expanded, setExpanded] = useState(false)
  // How many chips the collapsed list shows; null when every chip fits on two rows.
  const [limit, setLimit] = useState<Collapse | null>(null)
  const [toggleWidth, setToggleWidth] = useState(0)
  const box = useRef<HTMLDivElement>(null)
  const ruler = useRef<HTMLDivElement>(null)
  const names = peers.map((id) => model.bySubject.get(id)?.name ?? id)

  useLayoutEffect(() => {
    const outer = box.current
    const layer = ruler.current
    if (!outer || !layer) return
    const measure = () => {
      const origin = layer.getBoundingClientRect()
      const boxes = [...layer.children].map((el) => {
        const r = el.getBoundingClientRect()
        return { top: r.top - origin.top, bottom: r.bottom - origin.top, right: r.right - origin.left, width: r.width }
      })
      const toggle = boxes.pop()
      if (!toggle) return
      const gap = parseFloat(getComputedStyle(layer).columnGap) || 0
      const next = collapsedCount(boxes, toggle.width, gap, origin.width)
      setLimit((prev) => prev?.shown === next?.shown && prev?.squeeze === next?.squeeze ? prev : next)
      setToggleWidth(Math.ceil(toggle.width + gap))
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(outer)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => watch.disconnect()
  }, [names.join('\u0000')])

  // The name may end in an ellipsis on a narrow screen; the cross that removes it always shows.
  const label = (id: string, i: number) => <><span style={s.chipName}>{names[i] ?? id}</span> ×</>
  const collapsed = limit !== null && !expanded
  const shown = collapsed ? peers.slice(0, limit.shown) : peers
  // A long name alone on the second row is narrowed so the button still fits beside it.
  const squeezed = collapsed && limit.squeeze ? shown.length - 1 : -1

  return (
    <div ref={box} style={s.comparedWith} id="compared-with">
      {peers.length > 0 && (
        <div ref={ruler} style={s.ruler} aria-hidden="true" inert>
          <span style={s.eyebrow}>Compared with</span>
          {peers.map((id, i) => <span key={id} style={s.chip}>{label(id, i)}</span>)}
          <span style={s.more}>Show more</span>
        </div>
      )}
      <span style={s.eyebrow}>Compared with</span>
      {peers.length === 0 ? (
        <span style={{ color: 'var(--faint)', fontStyle: 'italic', fontSize: 12 }}>
          Nothing else is selected, so there is nothing to compare against.
        </span>
      ) : shown.map((id, i) => (
        <button key={id} type="button"
          style={i === squeezed ? { ...s.chip, maxWidth: `calc(100% - ${toggleWidth}px)` } : s.chip}
          title="Remove from the comparison"
          onClick={() => dispatch({ type: 'toggle-subject', id })}>
          {label(id, i)}
        </button>
      ))}
      {limit !== null && (
        <button type="button" style={s.more} aria-expanded={expanded} aria-controls="compared-with"
          data-compared-toggle={expanded ? 'hide' : 'show'}
          onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide more' : 'Show more'}
        </button>
      )}
    </div>
  )
}

/** A breadth bar: one segment per meaning, in the order the legend lists them. */
function Breadth({ model, subjectId, capabilities }: { model: Model; subjectId: string; capabilities: Capability[] }) {
  const cov = model.cov[subjectId] ?? {}
  const tally: Record<string, number> = {}
  for (const c of capabilities) {
    const level = levelOf(cov[c.id]) ?? 'u'
    tally[level] = (tally[level] ?? 0) + 1
  }
  const order: Array<[string, string, string | undefined]> = [
    ['n', 'built in', 'nv'], ['x', 'through an extension', 'xv'], ['p', 'partial', 'pv'],
    ['z', 'absent', 'zv'], ['c', 'conflict', 'cv'], ['o', 'out of scope', 'ov'],
    ['u', 'not assessed', undefined],
  ]
  return (
    <span style={{ display: 'flex', flex: 1, gap: 1, minWidth: 120 }}>
      {order.filter(([k]) => tally[k]).map(([k, word, code]) => (
        <span key={k} title={`${tally[k]} ${word}`}
          style={{ ...cellStyle(code, 12), flex: `${tally[k]} 1 0`, minWidth: 4, height: 13, borderRadius: 1, cursor: 'default' }} />
      ))}
    </span>
  )
}

interface ReadoutItem { cid: string; sid: string | null; name: string; tag: string; colour: string }

/**
 * Four readings derived from the claims already on screen. No new data, no
 * scoring, and no invented recommendation.
 */
function buildReadouts(model: Model, state: AppState, rows: Capability[]) {
  const focusId = state.focus!
  const cov = model.cov[focusId] ?? {}
  const peers = state.on.filter((id) => id !== focusId)
  const focusName = model.bySubject.get(focusId)?.name ?? focusId

  const missing: ReadoutItem[] = []
  const alone: ReadoutItem[] = []
  const evidence: ReadoutItem[] = []
  const mustMiss: ReadoutItem[] = []

  for (const c of rows) {
    const mine = levelOf(cov[c.id])
    const mineHas = mine === 'n' || mine === 'x'
    const peersWith = peers.filter((id) => ['n', 'x'].includes(levelOf(model.cov[id]?.[c.id]) ?? ''))

    if (!mineHas && peersWith.length) {
      missing.push({ cid: c.id, sid: peersWith[0], name: c.name, colour: 'var(--bad)',
        tag: `${peersWith.length} ${peersWith.length > 1 ? 'peers have it' : 'peer has it'}` })
    }
    if (mineHas && peersWith.length === 0 && peers.length) {
      alone.push({ cid: c.id, sid: focusId, name: c.name, tag: `only ${focusName.split(' ')[0]}`, colour: 'var(--ac)' })
    }
    const code = cov[c.id]
    if (code && (code[1] === 'u' || mine === 'c')) {
      evidence.push({ cid: c.id, sid: focusId, name: c.name, colour: 'var(--bad)',
        tag: mine === 'c' ? 'conflict' : 'unverified' })
    }
    if (c.interop === 'must' && !mineHas) {
      mustMiss.push({ cid: c.id, sid: focusId, name: c.name, tag: 'must agree', colour: 'var(--warn)' })
    }
  }

  return [
    { title: 'Missing beside its peers', sub: `built in or by extension for a peer, not for ${focusName}.`, items: missing },
    { title: 'Where it stands alone', sub: 'no peer in this comparison has it.', items: alone },
    { title: 'Evidence to firm up', sub: 'unverified claims and recorded conflicts.', items: evidence },
    { title: 'Must-agree rows it misses', sub: 'rows where two systems have to agree.', items: mustMiss },
  ]
}

const s = {
  hero: { display: 'flex', gap: 20, maxWidth: '100%', flexWrap: 'wrap', alignItems: 'flex-start', border: '1px solid var(--rule)', background: 'var(--panel)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 12 } as const,
  eyebrow: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  // The subject's name is a heading too: its own line spacing, not the body's 1.5.
  name: { margin: '2px 0 4px', fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 28, lineHeight: 1.15, letterSpacing: '-.01em' } as const,
  facts: { fontFamily: 'var(--fm)', fontSize: 11.5, color: 'var(--soft)' } as const,
  summary: { margin: '8px 0 0', maxWidth: '70ch', color: 'var(--soft)' } as const,
  scope: { margin: '8px 0 0', maxWidth: '70ch', paddingLeft: 10, borderLeft: '2px solid var(--rule)', fontFamily: 'var(--fm)', fontSize: 11.5, lineHeight: 1.5, color: 'var(--faint)' } as const,
  // Plain figures: no pointer, no underline, nothing that reads as a control.
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, minWidth: 72, textAlign: 'left' } as const,
  statNumber: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 26, lineHeight: 1, paddingBottom: 4 } as const,
  statLabel: { fontFamily: 'var(--fm)', fontSize: 9.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  comparedWith: { position: 'relative', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 } as const,
  // The invisible copy the rows are measured from: same width and flow, no height, never seen or reached.
  ruler: { position: 'absolute', left: 0, right: 0, top: 0, height: 0, overflow: 'hidden', visibility: 'hidden', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } as const,
  // One line per chip; a name longer than the column ends in an ellipsis rather than wrapping inside the chip.
  chip: { display: 'inline-flex', alignItems: 'baseline', maxWidth: '100%', whiteSpace: 'pre', boxSizing: 'border-box', fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 11.5, lineHeight: 1.5, background: 'var(--acF)', border: '1px solid var(--ac)', borderRadius: 'var(--r)', padding: '3px 8px', cursor: 'pointer', color: 'var(--ac)' } as const,
  chipName: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const,
  more: { display: 'inline-block', whiteSpace: 'nowrap', fontFamily: 'var(--fl)', fontSize: 11.5, lineHeight: 1.5, background: 'transparent', border: 0, borderRadius: 'var(--r)', color: 'var(--ac)', cursor: 'pointer', textDecoration: 'underline', padding: '3px 4px' } as const,
  panel: { border: '1px solid var(--rule)', background: 'var(--panel)', borderRadius: 'var(--r)', padding: '10px 14px 14px', marginBottom: 12 } as const,
  panelHead: { display: 'flex', alignItems: 'baseline', gap: 10, borderBottom: '1px solid var(--rule)', paddingBottom: 6, marginBottom: 8 } as const,
  hint: { margin: 0, fontSize: 11.5, color: 'var(--faint)', fontStyle: 'italic' } as const,
  groupRow: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid var(--rule)', padding: '6px 0', cursor: 'pointer', fontSize: 13, color: 'var(--ink)' } as const,
  capRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '3px 0 3px 22px', flexWrap: 'wrap' } as const,
  capName: { flex: '1 1 200px', minWidth: 0, textAlign: 'left', background: 'transparent', border: 0, cursor: 'pointer', fontSize: 12.5, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 } as const,
  must: { fontFamily: 'var(--fm)', fontSize: 8.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--warn)', border: '1px solid var(--warn)', borderRadius: 'var(--r)', padding: '0 4px' } as const,
  lane: { fontFamily: 'var(--fm)', fontSize: 8.5, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--lane)', border: '1px solid var(--lane)', borderRadius: 'var(--r)', padding: '0 4px' } as const,
  readouts: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))' } as const,
  readout: { border: '1px solid var(--rule)', background: 'var(--panel)', borderRadius: 'var(--r)', padding: '10px 14px 12px' } as const,
  readoutRow: { display: 'flex', alignItems: 'baseline', gap: 8, width: '100%', background: 'transparent', border: 0, borderBottom: '1px solid var(--rule)', padding: '4px 0', cursor: 'pointer', fontSize: 12, color: 'var(--ink)' } as const,
}
