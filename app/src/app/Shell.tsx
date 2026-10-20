// The shell every display sits inside: header, scope line, permanent legend,
// sidebar, and the address wiring.
//
// The scope line states what is being counted next to every percentage. That is
// not decoration: the old tool's percentages were unreadable because the basis
// was invisible.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { Basis, LaneId, Model, RowFilter } from '../design-model.ts'
import { LANE_LABEL, coverage, countedIds, matchCount, matchingRows, measuredCaps } from '../design-model.ts'
import { LEGEND, THEMES, cellStyle, read } from './marks.ts'
import { exportOptions } from './exports.ts'
import {
  PRESETS, decode, encode, initialState, preferredTheme, presetSubjects, queryOf, reducer,
  rememberTheme, storedTheme,
} from './state.ts'
import type { AppState, Preset, ViewId } from './state.ts'
import { SubjectView } from './SubjectView.tsx'
import { CompareView } from './CompareView.tsx'
import { GroupsView } from './GroupsView.tsx'
import { RelationsView } from './RelationsView.tsx'
import { VERSION } from '../version.ts'
import { RowPanel } from './RowPanel.tsx'
import { Comment } from './Comment.tsx'

const VIEWS: Array<{ id: ViewId; label: string }> = [
  { id: 'subject', label: 'Subject' },
  { id: 'compare', label: 'Compare' },
  { id: 'groups', label: 'Groups' },
  { id: 'relations', label: 'Relationships' },
]

const FILTERS: Array<{ id: RowFilter; label: string }> = [
  { id: 'all', label: 'Every capability' },
  { id: 'overlap', label: 'Two or more have it' },
  { id: 'thin', label: 'Exactly one has it built in' },
  { id: 'gap', label: 'Nobody has it built in or by extension' },
  { id: 'conflict', label: 'A conflict is recorded' },
  { id: 'connect', label: 'Agreed when systems connect' },
  { id: 'interop', label: 'Must interoperate' },
]

/** "1 production subjects" is the kind of wording this project exists to avoid. */
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

const BASES: Array<{ id: Basis; label: string }> = [
  { id: 'prod', label: 'Production subjects' },
  { id: 'all', label: 'Every selected subject' },
  { id: 'must', label: 'Must-agree rows only' },
]

export function Shell({ model }: { model: Model }) {
  const total = model.subjects.length
  const [state, dispatch] = useReducer(reducer, model, (m) => {
    const base = { ...initialState(m), theme: preferredTheme() }
    return decode(window.location.hash, m, base)
  })
  const [morePresets, setMorePresets] = useState(false)
  const [countingOpen, setCountingOpen] = useState(false)
  const [narrow, setNarrow] = useState(() => window.innerWidth < 1100)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportNote, setExportNote] = useState<string | null>(null)

  // The address this app wrote itself. replaceState fires no event, so a
  // one-shot ignore flag would be set and never consumed, and would swallow the
  // next genuine address change. Compare the value instead.
  const selfWritten = useRef<string | null>(null)
  // Keep incoming fragment bytes (including subject order and unknown fields)
  // until the reader changes the analysis. Preferences do not rewrite a link.
  const encodedState = useRef(encode(state, total))

  useEffect(() => {
    const encoded = encode(state, total)
    if (encoded === encodedState.current) return
    encodedState.current = encoded
    const next = `#${encoded}`
    if (next !== window.location.hash) {
      selfWritten.current = next
      window.history.replaceState(null, '', next)
    }
  }, [state, total])

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === selfWritten.current) return
      selfWritten.current = null
      const restored = decode(window.location.hash, model, state)
      encodedState.current = encode(restored, total)
      dispatch({ type: 'replace', state: restored })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [model, state])

  // Below 1100px the layout reflows: the sidebar stops holding a column and the
  // legend becomes a strip above the data rather than a column beside it.
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 1100)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    for (const [name, value] of Object.entries(THEMES[state.theme])) {
      root.style.setProperty(name, value)
    }
    // Native controls, scrollbars and the base stylesheet follow the chosen
    // theme, not the system one.
    root.dataset.theme = state.theme
    root.style.colorScheme = state.theme
  }, [state.theme])

  // Until the reader chooses, the theme keeps following the system setting.
  useEffect(() => {
    let media: MediaQueryList
    try { media = window.matchMedia('(prefers-color-scheme: dark)') } catch { return }
    const onChange = () => {
      if (!storedTheme()) dispatch({ type: 'theme', theme: media.matches ? 'dark' : 'light' })
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  // Escape unwinds one layer at a time, innermost first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (state.detail) dispatch({ type: 'detail', detail: null })
      else if (state.sidebar === 'open') dispatch({ type: 'sidebar', mode: 'collapsed' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.detail, state.sidebar])

  const query = queryOf(state)
  const rows = useMemo(() => matchingRows(model, query), [model, query])
  const cover = useMemo(() => coverage(model, query), [model, query])
  const counted = useMemo(() => countedIds(model, query), [model, query])
  const measured = useMemo(() => measuredCaps(model, query), [model, query])

  const applyPreset = useCallback((p: Preset) => {
    const on = presetSubjects(p, model)
    dispatch({
      type: 'preset',
      name: p.name,
      state: { on, view: p.view, filter: p.filter, lane: p.lane ?? null, focus: p.focus ?? on[0] },
    })
  }, [model])

  const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
  const toggleTheme = () => {
    rememberTheme(nextTheme)
    dispatch({ type: 'theme', theme: nextTheme })
  }

  const scope = [
    `${state.on.length} of ${total} subjects compared`,
    `${rows.length} of ${model.capabilities.length} rows shown`,
    `${cover.native}% built in · ${cover.extension}% with extensions · ${cover.partial}% with partial`,
    `counting ${plural(counted.length, `${state.basis === 'all' ? 'selected' : 'production'} subject`)}` +
      (state.lane ? ` · lane ${LANE_LABEL[state.lane]}` : ''),
  ]

  const question = {
    subject: state.focus
      ? `What does ${model.bySubject.get(state.focus)?.name} cover — and who covers what it does not?`
      : 'Pick a subject to start',
    compare: state.on.length === 1
      ? `What does the one selected subject cover?`
      : `Where do these ${state.on.length} subjects agree, differ, and leave a gap?`,
    groups: 'Which parts of the map are covered, and which are thin?',
    relations: 'Inside one group, who supports which capability?',
  }[state.view]

  // On a narrow screen the sidebar cannot hold its own column, so it shows as
  // the rail unless the reader has deliberately opened it, and then it floats.
  const rail = state.sidebar === 'collapsed' || (narrow && state.sidebar === 'pinned')

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={S.wordmark}>Spatial Systems Atlas</span>
          <span style={S.eyebrow}>Convergence / Interoperability Matrix</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
          <button type="button" style={S.themeToggle} onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`}>
            <ThemeIcon theme={state.theme} />
          </button>

          <button type="button" style={S.small(exportOpen)} aria-expanded={exportOpen}
            onClick={() => { setExportOpen(!exportOpen); setExportNote(null) }}>
            Export
          </button>
          {exportOpen && (
            <div style={S.exportMenu} role="menu">
              {exportOptions(model, query).map((option) => (
                <button key={option.label} type="button" style={S.exportItem} role="menuitem"
                  onClick={() => {
                    const result = option.run()
                    setExportNote(result === 'saved'
                      ? `Saved ${option.scope.rows.toLocaleString()} records with ${option.scope.fields} columns.`
                      : 'Your browser blocked the download. Nothing was saved.')
                    setExportOpen(false)
                  }}>
                  <strong style={{ fontFamily: 'var(--fl)', fontSize: 12 }}>{option.label}</strong>
                  <span style={{ fontSize: 11, color: 'var(--faint)' }}>
                    {option.scope.rows.toLocaleString()} claim records · {option.scope.fields} fields
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--soft)' }}>{option.scope.sentence}</span>
                </button>
              ))}
            </div>
          )}

          <Comment />
        </div>
      </header>
      {exportNote && (
        <p style={S.exportNote} role="status">
          {exportNote}
          <button type="button" style={S.disclosure} onClick={() => setExportNote(null)}>dismiss</button>
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 0, flex: 1, maxWidth: '100%' }}>
        <Sidebar
          model={model} state={state} dispatch={dispatch} rail={rail}
          morePresets={morePresets} setMorePresets={setMorePresets}
          applyPreset={applyPreset} rowsShown={rows.length}
        />

        <main style={S.main}>
          <div style={S.questionBar}>
            <h1 style={S.question}>{question}</h1>
            <div style={S.segmented}>
              {VIEWS.map((v, i) => (
                <button key={v.id} type="button" aria-pressed={state.view === v.id}
                  style={{ ...S.segment(state.view === v.id), borderRight: i < 3 ? '1px solid var(--ruleS)' : 0 }}
                  onClick={() => dispatch({ type: 'view', view: v.id })}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div style={S.scopeLine} className="scope">
            {scope.map((chip) => <span key={chip} style={S.scopeChip}>{chip}</span>)}
            <button type="button" style={S.disclosure} onClick={() => setCountingOpen(!countingOpen)}
              aria-expanded={countingOpen}>
              What is being counted?
            </button>
          </div>
          {countingOpen && (
            <p style={S.counting}>
              A capability counts as covered when at least one of the {counted.length} counted
              subjects reaches it. {measured.length} rows are measured
              {state.lane ? ' because a lane is active'
                : state.basis === 'must' ? ' because the basis is must-agree rows' : ''}.
              It says somebody has built the thing once, not that any two systems work together.
            </p>
          )}

          <div style={{
            display: 'flex', gap: 14, padding: '0 16px 28px',
            alignItems: 'flex-start',
            flexWrap: narrow ? 'wrap' : 'nowrap',
            flexDirection: narrow ? 'column-reverse' : 'row',
          }}>
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              {state.on.length === 0 ? (
                <Empty title="No subject is being compared"
                  why="Every percentage and every column here is drawn from the subjects you select."
                  fixLabel={`Select all ${total} subjects`}
                  fix={() => dispatch({ type: 'set-on', on: model.subjects.map((s) => s.id) })} />
              ) : rows.length === 0 ? (
                <Empty title="No capability matches this filter"
                  why={[
                    'The row filter is narrowing the list',
                    state.lane ? `the ${LANE_LABEL[state.lane]} lane is narrowing it further` : null,
                    state.hasEntry ? 'and rows nobody has assessed are switched off' : null,
                  ].filter(Boolean).join(', ') + '. Nothing is hidden by the subjects you picked.'}
                  fixLabel="Show every capability again"
                  fix={() => { dispatch({ type: 'filter', filter: 'all' }); dispatch({ type: 'lane', lane: null }); dispatch({ type: 'has-entry', value: false }) }} />
              ) : state.view === 'subject' ? (
                <SubjectView model={model} state={state} dispatch={dispatch} rows={rows} />
              ) : state.view === 'compare' ? (
                <CompareView model={model} state={state} dispatch={dispatch} rows={rows} />
              ) : state.view === 'groups' ? (
                <GroupsView model={model} state={state} dispatch={dispatch} />
              ) : (
                <RelationsView model={model} state={state} dispatch={dispatch} rows={rows} />
              )}
            </div>

            <aside style={narrow ? S.legendStrip : S.legend} aria-label="Reading the marks">
              <span style={S.legendHead}>Reading the marks</span>
              {LEGEND.map((entry) => (
                <div key={entry.label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ ...cellStyle(entry.code, 18), flex: '0 0 18px', cursor: 'default' }}>
                    {read(entry.code).glyph}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ fontFamily: 'var(--fl)', fontSize: 11.5, display: 'block' }}>{entry.label}</strong>
                    <span style={{ fontSize: 11, color: 'var(--faint)' }}>{entry.note}</span>
                  </span>
                </div>
              ))}
            </aside>
          </div>

          <footer style={S.footer}>
            <span>Version {VERSION}</span>
          </footer>
        </main>
      </div>

      {state.detail && (
        <RowPanel model={model} state={state}
          onClose={() => dispatch({ type: 'detail', detail: null })} />
      )}
    </div>
  )
}

/** Shows the theme in use: a sun in light, a moon in dark. */
function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {theme === 'dark' ? (
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
      )}
    </svg>
  )
}

function Empty({ title, why, fixLabel, fix }: { title: string; why: string; fixLabel: string; fix: () => void }) {
  return (
    <div style={S.empty} className="empty">
      <strong style={{ fontFamily: 'var(--fl)', fontSize: 15 }}>{title}</strong>
      <p style={{ margin: '6px 0 10px', color: 'var(--soft)' }}>{why}</p>
      <button type="button" style={S.primary} onClick={fix}>{fixLabel}</button>
    </div>
  )
}

function Sidebar({ model, state, dispatch, rail, morePresets, setMorePresets, applyPreset, rowsShown }: {
  model: Model
  state: AppState
  dispatch: React.Dispatch<import('./state.ts').Action>
  rail: boolean
  morePresets: boolean
  setMorePresets: (v: boolean) => void
  applyPreset: (p: Preset) => void
  rowsShown: number
}) {
  const [find, setFind] = useState('')

  if (rail) {
    return (
      <div style={S.rail}>
        <button type="button" style={S.railToggle} title="Open filters and options"
          onClick={() => dispatch({ type: 'sidebar', mode: 'pinned' })}>»</button>
        {[
          ['SUBJ', String(state.on.length)],
          ['ROWS', String(rowsShown)],
          ['BASIS', state.basis === 'prod' ? 'P' : state.basis === 'all' ? 'A' : 'M'],
          ['LANE', state.lane ?? '—'],
        ].map(([k, v]) => (
          <div key={k} style={S.railItem}><span style={S.railKey}>{k}</span><strong>{v}</strong></div>
        ))}
      </div>
    )
  }

  const presets = PRESETS.filter((p) => morePresets || !p.more)
  const query = queryOf(state)
  const q = find.trim().toLowerCase()

  return (
    <div style={S.sidebar(state.sidebar)}>
      <div style={S.sidebarHead}>
        <span style={S.tinyLabel}>Controls</span>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--faint)' }}>
          {state.sidebar === 'pinned' ? 'pinned' : 'floating'}
        </span>
        <button type="button" style={S.small(state.sidebar === 'pinned')}
          title={state.sidebar === 'pinned' ? 'Unpin — the panel floats over the display' : 'Pin — the panel keeps its own column'}
          onClick={() => dispatch({ type: 'sidebar', mode: state.sidebar === 'pinned' ? 'open' : 'pinned' })}>
          {state.sidebar === 'pinned' ? 'Pinned' : 'Pin'}
        </button>
        <button type="button" style={S.small(false)} title="Collapse to the rail"
          onClick={() => dispatch({ type: 'sidebar', mode: 'collapsed' })}>«</button>
      </div>

      <div style={S.sidebarBody}>
        <Section label="Presets">
          {presets.map((p) => (
            <button key={p.name} type="button" style={S.presetRow(p.name === state.presetName)}
              onClick={() => applyPreset(p)}>
              <strong style={{ fontFamily: 'var(--fl)', fontSize: 12 }}>{p.name}</strong>
              <span style={{ fontSize: 11, color: 'var(--faint)' }}>{p.scope}</span>
            </button>
          ))}
          <button type="button" style={S.disclosure} onClick={() => setMorePresets(!morePresets)}>
            {morePresets ? 'Fewer' : 'More'}
          </button>
        </Section>

        <Section label={`Subjects compared — ${state.on.length}/${model.subjects.length}`}>
          <input style={S.input} placeholder="Find a subject" value={find}
            onChange={(e) => setFind(e.target.value)} aria-label="Find a subject" />
          <div style={{ display: 'flex', gap: 6, margin: '6px 0' }}>
            <button type="button" style={S.small(false)}
              onClick={() => dispatch({ type: 'set-on', on: model.subjects.map((s) => s.id) })}>All on</button>
            <button type="button" style={S.small(false)}
              onClick={() => dispatch({ type: 'set-on', on: [] })}>None</button>
          </div>
          {model.displayGroups.map((g) => {
            const members = g.subjects
              .map((id) => model.bySubject.get(id))
              .filter((s) => s && (!q || s.name.toLowerCase().includes(q)))
            if (members.length === 0) return null
            const onCount = g.subjects.filter((id) => state.on.includes(id)).length
            const allOn = onCount === g.subjects.length
            return (
              <div key={g.id} style={{ marginBottom: 8 }}>
                <button type="button" style={S.groupHead} className="subject-group-head"
                  onClick={() => dispatch({
                    type: 'set-on',
                    on: allOn
                      ? state.on.filter((id) => !g.subjects.includes(id))
                      : [...new Set([...state.on, ...g.subjects])],
                  })}>
                  <span>{allOn ? '■' : onCount ? '▣' : '□'}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{g.name}</span>
                  <span style={{ color: 'var(--faint)' }}>{onCount}/{g.subjects.length}</span>
                </button>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {members.map((s) => (
                    <span key={s!.id} style={{ display: 'inline-flex' }}>
                      <button type="button" style={S.subjectChip(state.on.includes(s!.id))}
                        title={state.on.includes(s!.id) ? 'Remove from the comparison' : 'Add to the comparison'}
                        onClick={() => dispatch({ type: 'toggle-subject', id: s!.id })}>
                        {s!.name}
                      </button>
                      <button type="button" style={S.focusArrow}
                        title={`Put ${s!.name} in focus — everything else selected becomes its comparison`}
                        onClick={() => dispatch({ type: 'focus', id: s!.id })}>→</button>
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </Section>

        <Section label="Rows shown">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" style={S.choiceRow(state.filter === f.id)}
              onClick={() => dispatch({ type: 'filter', filter: f.id })}>
              <span>{state.filter === f.id ? '●' : '○'}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{f.label}</span>
              <span style={{ color: 'var(--faint)' }}>{matchCount(model, query, f.id)}</span>
            </button>
          ))}
          <button type="button" style={S.choiceRow(state.hasEntry)}
            onClick={() => dispatch({ type: 'has-entry', value: !state.hasEntry })}>
            <span>{state.hasEntry ? '■' : '□'}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Only rows somebody has assessed</span>
          </button>
        </Section>

        <Section label="What the percentages count">
          {BASES.map((b) => (
            <button key={b.id} type="button" style={S.choiceRow(state.basis === b.id)}
              onClick={() => dispatch({ type: 'basis', basis: b.id })}>
              <span>{state.basis === b.id ? '●' : '○'}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{b.label}</span>
            </button>
          ))}
          <p style={S.note}>Changes the percentages only. The rows on screen do not change.</p>
        </Section>

        <Section label="Use-case lane">
          {([null, 'U1', 'U2', 'U3', 'U4'] as Array<LaneId | null>).map((lane) => (
            <button key={lane ?? 'none'} type="button" style={S.choiceRow(state.lane === lane)}
              onClick={() => dispatch({ type: 'lane', lane })}>
              <span>{state.lane === lane ? '●' : '○'}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{lane ? LANE_LABEL[lane] : 'No lane'}</span>
              <span style={{ color: 'var(--faint)' }}>{lane ? model.lanes[lane].n : ''}</span>
            </button>
          ))}
        </Section>
      </div>
    </div>
  )
}

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <section style={{ padding: '10px 12px', borderBottom: '1px solid var(--rule)' }}>
    <span style={S.tinyLabel}>{label}</span>
    <div style={{ marginTop: 6 }}>{children}</div>
  </section>
)

// --- styles ---------------------------------------------------------------

const S = {
  root: { minHeight: '100vh', overflowX: 'hidden', maxWidth: '100vw', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--fb)', fontSize: 14, lineHeight: 1.5, display: 'flex', flexDirection: 'column' } as const,
  header: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '9px 16px', background: 'var(--panel)', borderBottom: '1px solid var(--ruleS)' } as const,
  wordmark: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase' } as const,
  eyebrow: { fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  tinyLabel: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  themeToggle: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 0, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)', borderRadius: 'var(--r)', cursor: 'pointer' } as const,
  segmented: { display: 'flex', border: '1px solid var(--ruleS)', borderRadius: 'var(--r)', overflow: 'hidden' } as const,
  segment: (on: boolean) => ({ fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 12, background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--bg)' : 'var(--ink)', border: 0, padding: '6px 13px', cursor: 'pointer' } as const),
  main: { flex: 1, minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' } as const,
  questionBar: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '14px 16px 8px' } as const,
  question: { margin: 0, fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', flex: 1, minWidth: 260 } as const,
  footer: { padding: '18px 16px 22px', borderTop: '1px solid var(--rule)', fontFamily: 'var(--fm)', fontSize: 10.5, letterSpacing: '.04em', color: 'var(--faint)' } as const,
  scopeLine: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '0 16px 10px', color: 'var(--soft)' } as const,
  scopeChip: { fontFamily: 'var(--fl)', fontSize: 11.5, border: '1px solid var(--rule)', borderRadius: 'var(--r)', padding: '3px 9px', background: 'var(--panel)' } as const,
  disclosure: { fontFamily: 'var(--fl)', fontSize: 11.5, background: 'transparent', border: 0, color: 'var(--ac)', cursor: 'pointer', textDecoration: 'underline', padding: 0 } as const,
  counting: { margin: '0 16px 10px', maxWidth: '78ch', fontSize: 13, color: 'var(--soft)', fontStyle: 'italic' } as const,
  legendStrip: { width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '9px 16px', padding: '9px 12px', background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 'var(--r)', marginBottom: 10 } as const,
  legend: { flex: '0 0 186px', width: 186, display: 'flex', flexDirection: 'column', gap: 9, position: 'sticky', top: 12, padding: '11px 12px', background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 'var(--r)' } as const,
  legendHead: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  sidebar: (mode: string) => ({ flex: '0 0 300px', width: 300, borderRight: '1px solid var(--ruleS)', background: mode === 'pinned' ? 'var(--bg)' : 'var(--panel)', boxShadow: mode === 'open' ? '6px 0 18px rgba(0,0,0,.14)' : 'none', position: 'sticky', top: 0, alignSelf: 'flex-start', maxHeight: '100vh', display: 'flex', flexDirection: 'column', minHeight: 0, zIndex: 5 } as const),
  sidebarHead: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderBottom: '1px solid var(--rule)' } as const,
  sidebarBody: { overflowY: 'auto', minHeight: 0 } as const,
  rail: { flex: '0 0 52px', width: 52, borderRight: '1px solid var(--ruleS)', background: 'var(--panel)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', padding: '10px 0', position: 'sticky', top: 0, alignSelf: 'flex-start' } as const,
  railToggle: { fontFamily: 'var(--fl)', fontSize: 13, background: 'var(--ink)', color: 'var(--bg)', border: 0, borderRadius: 'var(--r)', padding: '4px 8px', cursor: 'pointer' } as const,
  railItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'var(--fm)', fontSize: 11 } as const,
  railKey: { fontSize: 8, letterSpacing: '.08em', color: 'var(--faint)' } as const,
  presetRow: (on: boolean) => ({ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left', width: '100%', background: on ? 'var(--acF)' : 'transparent', border: `1px solid ${on ? 'var(--ac)' : 'var(--rule)'}`, borderRadius: 'var(--r)', padding: '5px 8px', cursor: 'pointer', marginBottom: 4 } as const),
  choiceRow: (on: boolean) => ({ display: 'flex', alignItems: 'baseline', gap: 6, width: '100%', textAlign: 'left', background: on ? 'var(--acF)' : 'transparent', border: `1px solid ${on ? 'var(--ac)' : 'transparent'}`, borderRadius: 'var(--r)', padding: '4px 6px', cursor: 'pointer', fontFamily: 'var(--fl)', fontSize: 12 } as const),
  groupHead: { display: 'flex', gap: 6, width: '100%', alignItems: 'center', background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 0' } as const,
  subjectChip: (on: boolean) => ({ fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 11, background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--bg)' : 'var(--soft)', border: '1px solid var(--rule)', borderRight: 0, borderRadius: 'var(--r) 0 0 var(--r)', padding: '3px 7px', cursor: 'pointer', maxWidth: '17ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const),
  focusArrow: { fontFamily: 'var(--fm)', fontSize: 10, background: 'transparent', color: 'var(--faint)', border: '1px solid var(--rule)', borderRadius: '0 var(--r) var(--r) 0', padding: '3px 5px', cursor: 'pointer' } as const,
  input: { width: '100%', fontFamily: 'var(--fl)', fontSize: 12, background: 'var(--bg)', border: '1px solid var(--ruleS)', borderRadius: 'var(--r)', padding: '5px 8px', color: 'var(--ink)' } as const,
  small: (on: boolean) => ({ fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 10.5, background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--bg)' : 'var(--ink)', border: `1px solid ${on ? 'var(--ink)' : 'var(--rule)'}`, borderRadius: 'var(--r)', padding: '3px 8px', cursor: 'pointer' } as const),
  note: { margin: '4px 0 0', fontSize: 11, color: 'var(--faint)', fontStyle: 'italic' } as const,
  exportMenu: { position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 40, width: 340, display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--panel)', border: '1px solid var(--ruleS)', borderRadius: 'var(--r)', boxShadow: '0 8px 22px rgba(0,0,0,.16)', padding: 6 } as const,
  exportItem: { display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left', background: 'transparent', border: 0, borderRadius: 'var(--r)', padding: '7px 9px', cursor: 'pointer', color: 'var(--ink)' } as const,
  exportNote: { margin: 0, padding: '6px 16px', background: 'var(--acF)', borderBottom: '1px solid var(--ac)', fontSize: 12, display: 'flex', gap: 10, alignItems: 'center' } as const,
  empty: { border: '1px solid var(--rule)', background: 'var(--panel)', borderRadius: 'var(--r)', padding: '16px 18px' } as const,
  primary: { fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 12, background: 'var(--ink)', color: 'var(--bg)', border: 0, borderRadius: 'var(--r)', padding: '6px 13px', cursor: 'pointer' } as const,
  pending: { border: '1px dashed var(--ruleS)', borderRadius: 'var(--r)', padding: '16px 18px', color: 'var(--soft)', fontStyle: 'italic' } as const,
}
