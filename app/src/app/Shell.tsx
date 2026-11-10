// The shell every display sits inside: header, scope line, permanent legend,
// sidebar, and the address wiring.
//
// The scope line states what is being counted next to every percentage. That is
// not decoration: the old tool's percentages were unreadable because the basis
// was invisible.

import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { Basis, LaneId, Model, RowFilter } from '../design-model.ts'
import { coverage, laneIds, laneLabel, countedIds, matchCount, matchingRows, measuredCaps, pickedRows } from '../design-model.ts'
import { LEGEND, THEMES, cellStyle, read } from './marks.ts'
import { exportOptions } from './exports.ts'
import {
  DOCK_MIN_DISPLAY, PANEL_IDS, PANEL_WIDTH, PRESETS_BOX, RAIL_WIDTH, addressOf, clampPanelWidth, decode, defaultPanelsDocked, encode, initialState, preferredTheme,
  listedPresets, nextPanels, presetBehindMore, presetQuestion, presetSubjects, queryOf, queryWithoutAddress, reducer, rememberLegendOpen, storedLegendOpen, rememberPanelWidth, rememberPanels, rememberPanelsDocked, rememberTheme, storedPanelWidth,
  storedPanels, storedPanelsDocked, storedTheme, withoutLegacyKeys,
} from './state.ts'
import type { AppState, PanelId, Preset, ViewId } from './state.ts'
import { historyStep, restoreFromAddress } from './history.ts'
import type { Written } from './history.ts'
import { SubjectView } from './SubjectView.tsx'
import { CompareView } from './CompareView.tsx'
import { GroupsView } from './GroupsView.tsx'
import { RelationsView } from './RelationsView.tsx'
import { Footer } from './Footer.tsx'
import { PREVIEW } from '../preview.ts'
import { RowPanel } from './RowPanel.tsx'
import { Comment } from './Comment.tsx'
import { Updates } from './Updates.tsx'
import { CANDIDATES, readCandidateFlag, writeCandidateFlag } from './explore-model.ts'
import type { CandidateId } from './explore-model.ts'
import { MapView } from './MapView.tsx'
import { LineupView } from './LineupView.tsx'
import { HoverTip } from './HoverTip.tsx'
import { WIDE_WIDTH, frame, pageLocked, panelMode } from './layout.ts'
import { CustomPreset } from './CustomPreset.tsx'

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
    return decode(addressOf(window.location.hash, window.location.search), m, base)
  })
  // A link to a preset behind "More" opens the list, so the selected preset shows.
  const [morePresets, setMorePresets] = useState(() => presetBehindMore(state.presetName))
  const [viewport, setViewport] = useState(() => window.innerWidth)
  const narrow = viewport < WIDE_WIDTH
  const [legendOpen, setLegendOpen] = useState(storedLegendOpen)
  const toggleLegend = () => {
    rememberLegendOpen(!legendOpen)
    setLegendOpen(!legendOpen)
  }
  // Below 1100px the panel column is pinned beside the display or floats over
  // it, by the reader's choice; until they choose, it docks wherever the display
  // keeps about 360px (defaultPanelsDocked). At 1100px and up it always docks.
  // On a phone an open panel is a sheet over the display, and there is no pin.
  const [panelWidth, setPanelWidth] = useState(storedPanelWidth)
  const [dockChoice, setDockChoice] = useState(storedPanelsDocked)
  const mode = panelMode(viewport, dockChoice, defaultPanelsDocked(viewport, panelWidth))
  const floating = mode === 'floating'
  const sheet = mode === 'sheet'
  const toggleDock = () => {
    rememberPanelsDocked(floating)
    setDockChoice(floating)
  }
  // Docked, the page holds still and the column and the display scroll on their own.
  const F = frame(pageLocked(floating))
  // The tool rail's sections. A floating column or a sheet covers the display,
  // so it opens closed and its changes are not kept as the reader's docked choice.
  // A sheet shows one section at a time.
  const [panels, setPanels] = useState<PanelId[]>(() => mode !== 'docked' ? [] : (storedPanels() ?? PANEL_IDS))
  // The column's close button hides the column and keeps its sections, so
  // reopening brings back exactly what was on. A sheet ignores it; it has Done.
  const [panelsClosed, setPanelsClosed] = useState(false)
  const closedRef = useRef(panelsClosed)
  closedRef.current = panelsClosed
  const modeRef = useRef(mode)
  modeRef.current = mode
  const togglePanel = useCallback((id: PanelId) => {
    setPanels((prev) => {
      const next = nextPanels(prev, id, modeRef.current, closedRef.current)
      if (modeRef.current === 'docked') rememberPanels(next)
      return next
    })
    setPanelsClosed(false)
  }, [])
  const closePanels = useCallback(() => setPanelsClosed(true), [])
  const reopenPanels = useCallback(() => setPanelsClosed(false), [])
  // Closing the sheet returns to the display at its top.
  const mainRef = useRef<HTMLElement>(null)
  const closeSheet = useCallback(() => {
    setPanels([])
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [])
  const [exportOpen, setExportOpen] = useState(false)
  const [exportNote, setExportNote] = useState<string | null>(null)

  // Candidate displays appear only with `?candidates` in
  // the address, so the live default is unchanged. Which one is open travels in
  // the same query parameter; the analysis address (the hash) is untouched.
  const [candidateFlag] = useState(() => PREVIEW ? readCandidateFlag(window.location.search) : readCandidateFlag(''))
  const [candidate, setCandidate] = useState<CandidateId | null>(candidateFlag.open)
  const openCandidate = useCallback((id: CandidateId | null) => {
    setCandidate(id)
    if (candidateFlag.enabled) {
      window.history.replaceState(null, '', writeCandidateFlag(window.location.search, id) + window.location.hash)
    }
  }, [candidateFlag.enabled])
  const focusFromCandidate = useCallback((id: string) => {
    openCandidate(null)
    dispatch({ type: 'focus', id })
  }, [openCandidate])
  const groupFromCandidate = useCallback((id: string) => {
    openCandidate(null)
    dispatch({ type: 'rel-group', id })
    dispatch({ type: 'view', view: 'relations' })
  }, [openCandidate])

  // The address this app wrote itself. replaceState fires no event, so a
  // one-shot ignore flag would be set and never consumed, and would swallow the
  // next genuine address change. Compare the value instead.
  const selfWritten = useRef<string | null>(null)
  // Keep incoming fragment bytes (including subject order and unknown fields)
  // until the reader changes the analysis. Preferences do not rewrite a link.
  const encodedState = useRef(encode(state, total))
  // The last write, for merging a burst of changes into one history entry.
  // Cleared on load and on back/forward, so the next change always pushes.
  const lastWrite = useRef<Written | null>(null)

  useEffect(() => {
    const encoded = encode(state, total)
    if (encoded === encodedState.current) return
    encodedState.current = encoded
    const next = `#${encoded}`
    if (next !== window.location.hash) {
      selfWritten.current = next
      const at = performance.now()
      const url = window.location.pathname + queryWithoutAddress(window.location.search) + next
      if (historyStep(lastWrite.current, encoded, at) === 'push') window.history.pushState(null, '', url)
      else window.history.replaceState(null, '', url)
      lastWrite.current = { encoded, at }
    }
  }, [state, total])

  // An old link may carry a retired key (the withdrawn figure filters). The
  // state already ignores it; this drops it from the address too, in place,
  // with no history entry, leaving every other byte as it was.
  useEffect(() => {
    dropLegacyKeys()
  }, [])

  // Back and forward fire popstate, and also hashchange when the fragment
  // differs; a typed fragment fires hashchange alone. Whichever comes first
  // restores; the other then matches selfWritten and is ignored.
  useEffect(() => {
    const onAddress = () => {
      if (window.location.hash === selfWritten.current) return
      selfWritten.current = window.location.hash
      lastWrite.current = null
      const restored = restoreFromAddress(window.location.hash, window.location.search, model, state)
      encodedState.current = encode(restored, total)
      dispatch({ type: 'replace', state: restored })
      if (dropLegacyKeys()) selfWritten.current = window.location.hash
    }
    window.addEventListener('popstate', onAddress)
    window.addEventListener('hashchange', onAddress)
    return () => {
      window.removeEventListener('popstate', onAddress)
      window.removeEventListener('hashchange', onAddress)
    }
  }, [model, state, total])

  // Below 1100px the layout reflows: the legend becomes a strip above the data
  // rather than a column beside it, and the panel column may float.
  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth)
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
      else if (sheet && panels.length) closeSheet()
      else if (floating && panels.length) closePanels()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state.detail, floating, sheet, panels.length, closeSheet, closePanels])

  const query = queryOf(state)
  const rows = useMemo(() => matchingRows(model, query), [model, query])
  const picked = useMemo(() => pickedRows(model, query), [model, query])
  const cover = useMemo(() => coverage(model, query), [model, query])
  const counted = useMemo(() => countedIds(model, query), [model, query])
  const measured = useMemo(() => measuredCaps(model, query), [model, query])

  // A preset behind "More", selected by a changed address, opens the list too.
  useEffect(() => {
    if (presetBehindMore(state.presetName)) setMorePresets(true)
  }, [state.presetName])

  const applyPreset = useCallback((p: Preset) => {
    const on = presetSubjects(p, model)
    // A preset chooses the display, so it closes a candidate display.
    openCandidate(null)
    dispatch({
      type: 'preset',
      name: p.name,
      // A preset writes the whole analysis, so the basis and the assessed-only
      // switch return to their defaults too.
      state: {
        on, view: p.view, filter: p.filter, lane: p.lane ?? null, focus: p.focus ?? on[0],
        basis: 'prod', hasEntry: false, sel: p.sel ?? [],
      },
    })
  }, [model, openCandidate])

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
      (state.lane ? ` · lane ${laneLabel(state.lane)}` : ''),
  ]

  // While a preset is selected the heading is its question. The moment the
  // reader changes the selection the preset is gone and the heading is generic.
  const question = (candidate && CANDIDATES.find((c) => c.id === candidate)?.question) || state.customPreset?.title || presetQuestion(state.presetName) || {
    subject: !state.focus
      ? 'Pick a subject to start'
      : 'What does the subject in focus cover — and who covers what it does not?',
    compare: state.on.length === 1
      ? `What does the one selected subject cover?`
      : `Where do these ${state.on.length} subjects agree, differ, and leave a gap?`,
    groups: 'What the spatial web covers, and where it is thin',
    relations: 'Inside one group, who supports which capability?',
  }[state.view]

  return (
    <div style={{ ...S.root, ...F.root }}>
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

          <Updates />
          <Comment />
        </div>
      </header>
      {exportNote && (
        <p style={S.exportNote} role="status">
          {exportNote}
          <button type="button" style={S.disclosure} onClick={() => setExportNote(null)}>dismiss</button>
        </p>
      )}

      <div style={F.body}>
        <Sidebar style={F.side}
          model={model} state={state} dispatch={dispatch}
          panels={panels} togglePanel={togglePanel} floating={floating}
          sheet={sheet} closeSheet={closeSheet}
          closed={panelsClosed && !sheet} closePanels={closePanels} reopenPanels={reopenPanels}
          toggleDock={narrow && !sheet ? toggleDock : null}
          width={panelWidth} setWidth={setPanelWidth}
          morePresets={morePresets} setMorePresets={setMorePresets}
          applyPreset={applyPreset} rowsShown={rows.length}
        />

        <main ref={mainRef} style={F.main}>
          <div style={S.questionBar}>
            <div style={{ flex: 1, minWidth: 'min(260px, 100%)', overflowWrap: 'anywhere' }}>
              <h1 style={S.question}>{question}</h1>
              {!candidate && state.customPreset?.details && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--soft)' }}>{state.customPreset.details}</p>}
            </div>
            <div style={S.segmented} role="group" aria-label="Display">
              {VIEWS.map((v, i) => (
                <button key={v.id} type="button" aria-pressed={!candidate && state.view === v.id}
                  className="segment" style={S.segment(!candidate && state.view === v.id, i > 0)}
                  onClick={() => {
                    if (candidate) openCandidate(null)
                    if (!candidate || state.view !== v.id) dispatch({ type: 'view', view: v.id })
                  }}>
                  {v.label}
                </button>
              ))}
              {candidateFlag.enabled && CANDIDATES.map((c) => (
                <button key={c.id} type="button" aria-pressed={candidate === c.id}
                  className="segment" style={{ ...S.segment(candidate === c.id, true), fontStyle: 'italic' }}
                  title="Candidate display, shown only with ?candidates in the address"
                  onClick={() => openCandidate(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
            <HoverTip label="What is shown and counted" triggerStyle={S.metricsButton}
              openStyle={{ background: 'var(--ink)', color: 'var(--bg)' }}
              trigger={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M4 20h16M7 16v-5M12 16V6M17 16v-8" />
                </svg>
              }>
              <ul style={S.tipList}>
                {scope.map((line) => <li key={line}>{line}</li>)}
              </ul>
              {picked && (
                <p style={S.tipNote}>
                  Showing {picked.size === 1 ? 'one picked row' : `${picked.size} picked rows`}.
                  {rows.length < picked.size ? ` ${rows.length} pass the current row filter.` : ''}{' '}
                  <button type="button" style={S.disclosure} onClick={() => dispatch({ type: 'clear-picked' })}>
                    Show every row
                  </button>
                </p>
              )}
              <p style={{ ...S.tipNote, color: 'var(--soft)' }}>
                A capability counts as covered when at least one of the {counted.length} counted
                subjects reaches it. {measured.length} rows are measured
                {state.lane ? ' because a lane is active'
                  : state.basis === 'must' ? ' because the basis is must-agree rows' : ''}.
                It says somebody has built the thing once, not that any two systems work together.
              </p>
            </HoverTip>
          </div>

          {/* Closed above the display, the bar of marks sits a few pixels over it. */}
          <div style={{
            display: 'flex', gap: narrow && !legendOpen && !candidate ? 4 : 14, padding: '0 16px 28px',
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
                    state.lane ? `the ${laneLabel(state.lane)} lane is narrowing it further` : null,
                    state.hasEntry ? 'and rows nobody has assessed are switched off' : null,
                  ].filter(Boolean).join(', ') + '. Nothing is hidden by the subjects you picked.'}
                  fixLabel="Show every capability again"
                  fix={() => { dispatch({ type: 'filter', filter: 'all' }); dispatch({ type: 'lane', lane: null }); dispatch({ type: 'has-entry', value: false }) }} />
              ) : candidate === 'map' ? (
                <MapView model={model} state={state} dispatch={dispatch} rows={rows}
                  onFocusSubject={focusFromCandidate} onOpenGroup={groupFromCandidate} />
              ) : candidate === 'lineup' ? (
                <LineupView model={model} state={state} dispatch={dispatch} rows={rows}
                  onFocusSubject={focusFromCandidate} />
              ) : state.view === 'subject' ? (
                <SubjectView model={model} state={state} dispatch={dispatch} rows={rows} />
              ) : state.view === 'compare' ? (
                <CompareView model={model} state={state} dispatch={dispatch} rows={rows} />
              ) : state.view === 'groups' ? (
                <GroupsView model={model} state={state} dispatch={dispatch} rows={rows} />
              ) : (
                <RelationsView model={model} state={state} dispatch={dispatch} rows={rows} />
              )}
            </div>

            {/* A candidate display carries its own key and card in this column. */}
            {/* Closed, the legend is a bar of the toggle and the nine marks, each
                with its two lines in a tip: a slim column beside the display, a row above it. */}
            {!candidate && <aside aria-label="Reading the marks"
              style={legendOpen ? (narrow ? S.legendStrip : S.legend) : (narrow ? S.legendBarRow : S.legendBar)}>
              <button type="button" style={legendOpen ? S.legendToggle : S.legendToggleShut} onClick={toggleLegend}
                aria-expanded={legendOpen} aria-controls="legend-entries">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false"
                  style={{ transform: legendOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s ease' }}>
                  <path d="M3 1.5L7 5L3 8.5z" fill="currentColor" />
                </svg>
                <span style={legendOpen ? S.legendHead : S.srOnly}>Reading the marks</span>
              </button>
              {!legendOpen && (
                <div id="legend-entries" style={{ display: 'flex', flexDirection: narrow ? 'row' : 'column', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {LEGEND.map((entry) => (
                    <HoverTip key={entry.label} label={entry.label} beside={!narrow} width={220}
                      triggerStyle={{ ...cellStyle(entry.code, 18), margin: 0, cursor: 'help' }}
                      openStyle={{ outline: '2px solid var(--ac)', outlineOffset: 1 }}
                      trigger={read(entry.code).glyph}>
                      <strong style={{ fontFamily: 'var(--fl)', fontSize: 11.5, display: 'block' }}>{entry.label}</strong>
                      <span style={{ fontSize: 11, color: 'var(--faint)' }}>{entry.note}</span>
                    </HoverTip>
                  ))}
                </div>
              )}
              {legendOpen && LEGEND.map((entry) => (
                <div key={entry.label} id={entry === LEGEND[0] ? 'legend-entries' : undefined} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ ...cellStyle(entry.code, 18), flex: '0 0 18px', cursor: 'default' }}>
                    {read(entry.code).glyph}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ fontFamily: 'var(--fl)', fontSize: 11.5, display: 'block' }}>{entry.label}</strong>
                    <span style={{ fontSize: 11, color: 'var(--faint)' }}>{entry.note}</span>
                  </span>
                </div>
              ))}
            </aside>}
          </div>

          <Footer style={S.footer} />
        </main>
      </div>

      {state.detail && (
        <RowPanel model={model} state={state}
          onClose={() => dispatch({ type: 'detail', detail: null })} />
      )}
    </div>
  )
}

/** Removes retired keys from the address in place. True when it changed anything. */
function dropLegacyKeys(): boolean {
  const { pathname, search, hash } = window.location
  const clean = withoutLegacyKeys(search) + withoutLegacyKeys(hash)
  if (clean === search + hash) return false
  window.history.replaceState(window.history.state, '', pathname + clean)
  return true
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

/** The tool rail's buttons, in rail order. The icon is drawn by RailIcon. */
const RAIL: Array<{ id: PanelId; label: string; section: string }> = [
  { id: 'presets', label: 'Presets', section: 'Presets' },
  { id: 'subjects', label: 'Subjects', section: 'Subjects compared' },
  { id: 'rows', label: 'Rows', section: 'Rows shown' },
  { id: 'counting', label: 'Counting', section: 'What the percentages count' },
  { id: 'lane', label: 'Lane', section: 'Use-case lane' },
]

/**
 * The tool rail and the column of sections it shows. Each rail button shows or
 * hides one section; several may be on at once and they stack in rail order.
 * With none on, the column is gone and the display takes the width. The close
 * button at the column's top right hides the column but keeps its sections; the
 * rail's Open button, or any section's rail button, brings it back with them.
 * Below 1100px the pin beside the close button docks the column beside the
 * display or floats it over the display. On a phone the section is a sheet over
 * the whole display, closed by its Done button or by its rail button again.
 */
function Sidebar({
  style, model, state, dispatch, panels, togglePanel, floating, sheet, closeSheet, closed, closePanels, reopenPanels,
  toggleDock, width, setWidth, morePresets, setMorePresets, applyPreset, rowsShown,
}: {
  style: React.CSSProperties
  model: Model
  state: AppState
  dispatch: React.Dispatch<import('./state.ts').Action>
  panels: PanelId[]
  togglePanel: (id: PanelId) => void
  floating: boolean
  sheet: boolean
  closeSheet: () => void
  /** The column is closed by its close button; its sections are kept for reopening. */
  closed: boolean
  closePanels: () => void
  reopenPanels: () => void
  toggleDock: (() => void) | null
  width: number
  setWidth: (w: number) => void
  morePresets: boolean
  setMorePresets: (v: boolean) => void
  applyPreset: (p: Preset) => void
  rowsShown: number
}) {
  const [find, setFind] = useState('')

  const presets = listedPresets(morePresets)
  const presetBox = useRef<HTMLDivElement>(null)
  const presetsOn = panels.includes('presets')

  // Opened, the list is a box exactly six cards tall, measured from the cards
  // themselves because a long scope line wraps to two lines in a narrow column.
  // The selected card is scrolled into view inside the box, not the page.
  useLayoutEffect(() => {
    const box = presetBox.current
    if (!box) return
    if (!morePresets) { box.style.maxHeight = ''; return }
    const fit = () => {
      const cards = box.children as HTMLCollectionOf<HTMLElement>
      const last = cards[Math.min(PRESETS_BOX, cards.length) - 1]
      if (last) box.style.maxHeight = `${last.offsetTop + last.offsetHeight - cards[0].offsetTop}px`
    }
    fit()
    const watch = new ResizeObserver(fit)
    watch.observe(box)
    const on = box.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (on) {
      // The box is the cards' offset parent, so offsetTop is already inside it.
      const top = on.offsetTop
      if (top < box.scrollTop || top + on.offsetHeight > box.scrollTop + box.clientHeight) {
        box.scrollTop = top - (box.clientHeight - on.offsetHeight) / 2
      }
    }
    return () => watch.disconnect()
  }, [morePresets, presetsOn, state.presetName])
  const query = queryOf(state)
  const q = find.trim().toLowerCase()

  const badge: Record<PanelId, string | null> = {
    presets: null,
    subjects: String(state.on.length),
    rows: String(rowsShown),
    counting: state.basis === 'prod' ? 'P' : state.basis === 'all' ? 'A' : 'M',
    lane: state.lane,
  }

  const sections: Record<PanelId, React.ReactNode> = {
    presets: (
      <>
        <div ref={presetBox} style={morePresets ? S.presetBox : undefined}>
          {presets.map((p) => (
            <button key={p.name} type="button" style={S.presetRow(p.name === state.presetName)}
              aria-pressed={p.name === state.presetName} onClick={() => applyPreset(p)}>
              <strong style={{ fontFamily: 'var(--fl)', fontSize: 12 }}>{p.name}</strong>
              <span style={{ fontSize: 11, color: 'var(--faint)' }}>{p.scope}</span>
            </button>
          ))}
        </div>
        <button type="button" style={S.disclosure} onClick={() => setMorePresets(!morePresets)}>
          {morePresets ? 'Fewer' : 'More'}
        </button>
        <CustomPreset model={model} state={state} dispatch={dispatch} />
      </>
    ),
    subjects: (
      <>
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
      </>
    ),
    rows: (
      <>
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
        {state.sel.length > 0 && (
          <p style={S.note}>
            {state.sel.length} picked rows.{' '}
            <button type="button" style={S.disclosure} onClick={() => dispatch({ type: 'clear-picked' })}>
              Show every row
            </button>
          </p>
        )}
      </>
    ),
    counting: (
      <>
        {BASES.map((b) => (
          <button key={b.id} type="button" style={S.choiceRow(state.basis === b.id)}
            onClick={() => dispatch({ type: 'basis', basis: b.id })}>
            <span>{state.basis === b.id ? '●' : '○'}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{b.label}</span>
          </button>
        ))}
        <p style={S.note}>Changes the percentages only. The rows on screen do not change.</p>
      </>
    ),
    lane: (
      <>
        {([null, ...laneIds(model)] as Array<LaneId | null>).map((lane) => (
          <button key={lane ?? 'none'} type="button" style={S.choiceRow(state.lane === lane)}
            onClick={() => dispatch({ type: 'lane', lane })}>
            <span>{state.lane === lane ? '●' : '○'}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{lane ? laneLabel(lane) : 'No lane'}</span>
            <span style={{ color: 'var(--faint)' }}>{lane ? matchCount(model, { ...query, lane }, state.filter) : ''}</span>
          </button>
        ))}
      </>
    ),
  }

  // A floating panel must leave the rail and a sliver of the display visible; a
  // docked one below 1100px leaves the display its 360px where the screen allows.
  const maxWidth = floating ? Math.max(PANEL_WIDTH.min, window.innerWidth - RAIL_WIDTH - 24)
    : toggleDock ? Math.min(PANEL_WIDTH.max, Math.max(PANEL_WIDTH.min, window.innerWidth - RAIL_WIDTH - DOCK_MIN_DISPLAY))
    : PANEL_WIDTH.max
  const shown = Math.min(width, maxWidth)

  return (
    <div style={style}>
      <nav style={S.rail} aria-label="Panels">
        {closed && panels.length > 0 && (
          <button type="button" className="rail-button" style={S.railButton(false)}
            aria-label="Open the panel column" title="Open the panel column, with the sections that were on"
            data-panels-reopen onClick={reopenPanels}>
            <ColumnIcon />
            <span style={S.railLabel}>Open</span>
          </button>
        )}
        {RAIL.map((r) => {
          const kept = panels.includes(r.id)
          const on = kept && !closed
          return (
            <button key={r.id} type="button" className="rail-button" style={S.railButton(on, kept && closed)}
              aria-pressed={on} aria-controls={on ? `panel-${r.id}` : undefined}
              title={closed ? `Open the panel column with ${r.section}` : `${on ? 'Hide' : 'Show'} ${r.section}`}
              onClick={() => togglePanel(r.id)}>
              <RailIcon id={r.id} />
              <span style={S.railLabel}>{r.label}</span>
              {badge[r.id] && <span style={S.railBadge} aria-label={`currently ${badge[r.id]}`}>{badge[r.id]}</span>}
            </button>
          )
        })}
      </nav>

      {panels.length > 0 && !closed && (
        <div style={sheet ? S.sheet : S.panel(shown, floating)} aria-label="Controls" role="region" id="panel-column">
          {sheet && (
            <div style={S.sheetBar}>
              <button type="button" style={S.primary} onClick={closeSheet}>Done</button>
            </div>
          )}
          {!sheet && (
            <div style={S.panelControls}>
              {toggleDock && (
                <button type="button" className="panel-control panel-pin" style={S.panelControl(!floating)} onClick={toggleDock}
                  aria-pressed={!floating} aria-label="Pin the panels beside the display"
                  title={floating ? 'Floating over the display · click to pin beside it' : 'Pinned beside the display · click to float over it'}>
                  <PinIcon pinned={!floating} />
                </button>
              )}
              <button type="button" className="panel-control panel-close" style={S.panelControl(false)} onClick={closePanels}
                aria-label="Close the panel column" title="Close the panel column · the rail's Open button brings it back">
                <CloseIcon />
              </button>
            </div>
          )}
          <div style={S.panelBody}>
            {RAIL.filter((r) => panels.includes(r.id)).map((r, i) => (
              <Section key={r.id} id={`panel-${r.id}`} reserve={i === 0 && !sheet ? (toggleDock ? 56 : 30) : 0}
                label={r.id === 'subjects' ? `${r.section} — ${state.on.length}/${model.subjects.length}` : r.section}>
                {sections[r.id]}
              </Section>
            ))}
          </div>
          {!sheet && <ResizeHandle width={shown} max={maxWidth} setWidth={setWidth} />}
        </div>
      )}
    </div>
  )
}

/**
 * The drag handle on the panel column's right edge. Drag, or Left and Right
 * arrows in 16px steps; double-click returns to the default width.
 */
function ResizeHandle({ width, max, setWidth }: { width: number; max: number; setWidth: (w: number) => void }) {
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ x: number; w: number } | null>(null)
  const clamp = (w: number) => Math.min(max, clampPanelWidth(w))
  const commit = (w: number) => {
    const next = clamp(w)
    setWidth(next)
    rememberPanelWidth(next)
  }

  return (
    <div role="separator" aria-orientation="vertical" aria-label="Resize the panel column"
      aria-valuemin={PANEL_WIDTH.min} aria-valuemax={max} aria-valuenow={width}
      tabIndex={0} title="Drag to resize · double-click to reset"
      className={`panel-resize${dragging ? ' dragging' : ''}`} style={S.resize}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        start.current = { x: e.clientX, w: width }
        setDragging(true)
      }}
      onPointerMove={(e) => {
        if (!start.current) return
        setWidth(clamp(start.current.w + e.clientX - start.current.x))
      }}
      onPointerUp={(e) => {
        if (!start.current) return
        commit(start.current.w + e.clientX - start.current.x)
        start.current = null
        setDragging(false)
      }}
      onPointerCancel={() => { start.current = null; setDragging(false) }}
      onDoubleClick={() => commit(PANEL_WIDTH.initial)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
          commit(width + (e.key === 'ArrowRight' ? PANEL_WIDTH.step : -PANEL_WIDTH.step))
        } else if (e.key === 'Home' || e.key === 'End') {
          e.preventDefault()
          commit(e.key === 'Home' ? PANEL_WIDTH.min : max)
        }
      }}
    />
  )
}

/** A pin: upright and filled when pinned, tilted and hollow when the column floats. */
function PinIcon({ pinned }: { pinned: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      style={{ transform: pinned ? 'none' : 'rotate(45deg)' }}>
      <path d="M9 3h6l-1 6 4 4H6l4-4z" />
      <path d="M12 13v8" fill="none" />
    </svg>
  )
}

/** The close cross beside the pin. */
function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  )
}

/** The rail's Open button: a column with an arrow out of it. */
function ColumnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
      <path d="M9 4v16M13 9.5l2.5 2.5L13 14.5" />
    </svg>
  )
}

/** Simple line icons for the rail. */
function RailIcon({ id }: { id: PanelId }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {id === 'presets' && <path d="M6 3h12v18l-6-4.5L6 21z" />}
      {id === 'subjects' && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
        </>
      )}
      {id === 'rows' && <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />}
      {id === 'counting' && (
        <>
          <path d="M19 5L5 19" />
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
        </>
      )}
      {id === 'lane' && <path d="M6 21L9 3M18 21L15 3M12 4v3M12 10.5v3M12 17v3" />}
    </svg>
  )
}

/** One rail section. `reserve` keeps the first label clear of the pin and close buttons laid over it. */
const Section = ({ id, label, reserve = 0, children }: { id?: string; label: string; reserve?: number; children: React.ReactNode }) => (
  <section id={id} aria-label={label} style={{ padding: '10px 12px', borderBottom: '1px solid var(--rule)' }}>
    <span style={reserve ? { ...S.tinyLabel, display: 'inline-block', maxWidth: '100%', boxSizing: 'border-box', paddingRight: reserve } : S.tinyLabel}>{label}</span>
    <div style={{ marginTop: 6 }}>{children}</div>
  </section>
)

// --- styles ---------------------------------------------------------------

const S = {
  // The frame (height, scrolling, the footer's room) is in layout.ts.
  root: { background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--fb)', fontSize: 14, lineHeight: 1.5 } as const,
  header: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '9px 16px', background: 'var(--panel)', borderBottom: '1px solid var(--ruleS)' } as const,
  wordmark: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase' } as const,
  eyebrow: { fontFamily: 'var(--fm)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  tinyLabel: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  themeToggle: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 0, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)', borderRadius: 'var(--r)', cursor: 'pointer' } as const,
  // One container owns the only outer border and the rounded corners. Segments
  // carry no border of their own, only a 1px divider on their left, written as
  // longhands so React never mixes a shorthand with a side on re-render.
  // On a phone the four labels can be wider than the column; the padding narrows first, and as a last
  // resort a label wraps to a second line of the control rather than being cut off.
  segmented: { display: 'inline-flex', flexWrap: 'wrap', maxWidth: '100%', alignItems: 'stretch', border: '1px solid var(--ruleS)', borderRadius: 6, overflow: 'hidden', background: 'var(--panel)' } as const,
  segment: (on: boolean, divider: boolean) => ({ fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 12, lineHeight: '18px', background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--bg)' : 'var(--ink)', borderStyle: 'solid', borderColor: 'var(--ruleS)', borderWidth: divider ? '0 0 0 1px' : 0, borderRadius: 0, margin: 0, padding: '6px clamp(7px, 2vw, 14px)', flex: '1 0 auto', cursor: 'pointer' } as const),
  questionBar: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: '14px 16px 8px' } as const,
  // A heading's own line spacing, not the body's 1.5. Its column keeps 260px, so the
  // display switcher wraps below a long question rather than sitting over it.
  question: { margin: 0, fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 21, lineHeight: 1.15, letterSpacing: '-.01em' } as const,
  // Fixed to the foot of the window, above the page and the side rail, below tips, the row panel and dialogs.
  footer: { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, padding: '4px 16px', background: 'var(--panel)', borderTop: '1px solid var(--rule)', fontFamily: 'var(--fm)', fontSize: 10, lineHeight: 1.5, letterSpacing: '.04em', color: 'var(--faint)' } as const,
  disclosure: { fontFamily: 'var(--fl)', fontSize: 11.5, background: 'transparent', border: 0, color: 'var(--ac)', cursor: 'pointer', textDecoration: 'underline', padding: 0 } as const,
  // Open above the display: equal columns, so each mark box lines up under the one above it.
  legendStrip: { width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(120px, 100%), 1fr))', gap: '9px 16px', padding: '9px 12px', background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 'var(--r)', marginBottom: 10 } as const,
  legend: { flex: '0 0 186px', width: 186, display: 'flex', flexDirection: 'column', gap: 9, position: 'sticky', top: 12, padding: '11px 12px', background: 'var(--panel)', border: '1px solid var(--rule)', borderRadius: 'var(--r)' } as const,
  legendToggle: { display: 'flex', alignItems: 'center', gap: 6, flexBasis: '100%', gridColumn: '1 / -1', padding: 0, margin: 0, border: 0, background: 'none', color: 'var(--faint)', cursor: 'pointer', textAlign: 'left' } as const,
  // The closed legend: a slim column of marks beside the display, or one row above it.
  // Only the toggle and the marks, on the page background: no box, line or fill.
  legendBar: { flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'sticky', top: 12, padding: 0 } as const,
  legendBarRow: { width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 0, marginTop: 4 } as const,
  legendToggleShut: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, padding: 0, margin: 0, border: 0, background: 'none', color: 'var(--faint)', cursor: 'pointer' } as const,
  srOnly: { position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 } as const,
  legendHead: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  rail: { flex: '0 0 64px', width: 64, height: '100%', borderRight: '1px solid var(--ruleS)', background: 'var(--panel)', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' } as const,
  // `kept`: the section is on but the column is closed, so it shows again on reopening (a dashed outline).
  railButton: (on: boolean, kept = false) => ({ position: 'relative', width: 58, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 2px 6px', margin: 0, background: on ? 'var(--acF)' : 'transparent', color: on ? 'var(--ac)' : 'var(--soft)', borderStyle: kept ? 'dashed' : 'solid', borderWidth: 1, borderColor: on || kept ? 'var(--ac)' : 'transparent', borderRadius: 6, cursor: 'pointer' } as const),
  railLabel: { fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 9, letterSpacing: '.03em', textTransform: 'uppercase', lineHeight: 1.1, maxWidth: '100%' } as const,
  railBadge: { position: 'absolute', top: 3, right: 3, minWidth: 15, padding: '0 3px', fontFamily: 'var(--fm)', fontSize: 8.5, lineHeight: '13px', textAlign: 'center', color: 'var(--soft)', background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 7 } as const,
  panel: (width: number, floating: boolean) => ({ position: floating ? 'absolute' : 'relative', left: floating ? 64 : undefined, top: 0, flex: `0 0 ${width}px`, width, height: '100%', background: floating ? 'var(--panel)' : 'var(--bg)', borderRight: '1px solid var(--ruleS)', boxShadow: floating ? '6px 0 18px rgba(0,0,0,.18)' : 'none', display: 'flex', flexDirection: 'column', minHeight: 0 } as const),
  // On a phone: the whole display, from the rail to the screen's right edge, with Done above its own scroll.
  sheet: { position: 'absolute', left: 64, top: 0, width: 'calc(100vw - 64px)', height: '100%', background: 'var(--panel)', display: 'flex', flexDirection: 'column', minHeight: 0 } as const,
  sheetBar: { flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', padding: '8px 12px', borderBottom: '1px solid var(--ruleS)' } as const,
  panelBody: { overflowY: 'auto', minHeight: 0, flex: 1 } as const,
  // The pin and the close button, overlaid on the first section's header line, so they take no room of their own;
  // that section's label keeps clear of them. Each is a 24px target around a small glyph.
  panelControls: { position: 'absolute', top: 9, right: 8, zIndex: 1, display: 'flex', gap: 2 } as const,
  panelControl: (on: boolean) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, boxSizing: 'border-box', padding: 0, margin: 0, background: 'transparent', color: on ? 'var(--ac)' : 'var(--soft)', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer' } as const),
  resize: { position: 'absolute', top: 0, right: -5, width: 9, height: '100%', cursor: 'col-resize', zIndex: 2, touchAction: 'none' } as const,
  // The opened preset list; its height is set from the first six cards. The section header stays above it.
  presetBox: { position: 'relative', overflowY: 'auto', overscrollBehavior: 'contain', marginBottom: 4 } as const,
  presetRow: (on: boolean) => ({ display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'left', width: '100%', background: on ? 'var(--acF)' : 'transparent', border: `1px solid ${on ? 'var(--ac)' : 'var(--rule)'}`, borderRadius: 'var(--r)', padding: '5px 8px', cursor: 'pointer', marginBottom: 4, color: 'var(--ink)' } as const),
  choiceRow: (on: boolean) => ({ display: 'flex', alignItems: 'baseline', gap: 6, width: '100%', textAlign: 'left', background: on ? 'var(--acF)' : 'transparent', border: `1px solid ${on ? 'var(--ac)' : 'transparent'}`, borderRadius: 'var(--r)', padding: '4px 6px', cursor: 'pointer', fontFamily: 'var(--fl)', fontSize: 12 } as const),
  groupHead: { display: 'flex', gap: 6, width: '100%', alignItems: 'center', background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', padding: '2px 0' } as const,
  subjectChip: (on: boolean) => ({ fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 11, background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--bg)' : 'var(--soft)', border: '1px solid var(--rule)', borderRight: 0, borderRadius: 'var(--r) 0 0 var(--r)', padding: '3px 7px', cursor: 'pointer', maxWidth: '17ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const),
  focusArrow: { fontFamily: 'var(--fm)', fontSize: 10, background: 'transparent', color: 'var(--faint)', border: '1px solid var(--rule)', borderRadius: '0 var(--r) var(--r) 0', padding: '3px 5px', cursor: 'pointer' } as const,
  input: { width: '100%', fontFamily: 'var(--fl)', fontSize: 12, background: 'var(--bg)', border: '1px solid var(--ruleS)', borderRadius: 'var(--r)', padding: '5px 8px', color: 'var(--ink)' } as const,
  small: (on: boolean) => ({ fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 10.5, background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--bg)' : 'var(--ink)', border: `1px solid ${on ? 'var(--ink)' : 'var(--rule)'}`, borderRadius: 'var(--r)', padding: '3px 8px', cursor: 'pointer' } as const),
  metricsButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, padding: 0, border: '1px solid var(--ruleS)', borderRadius: 6, cursor: 'pointer', background: 'var(--panel)', color: 'var(--ink)' } as const,
  tipList: { margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 3 } as const,
  tipNote: { margin: '8px 0 0', maxWidth: '62ch', fontSize: 12.5 } as const,
  note: { margin: '4px 0 0', fontSize: 11, color: 'var(--faint)', fontStyle: 'italic' } as const,
  exportMenu: { position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 40, width: 340, display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--panel)', border: '1px solid var(--ruleS)', borderRadius: 'var(--r)', boxShadow: '0 8px 22px rgba(0,0,0,.16)', padding: 6 } as const,
  exportItem: { display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left', background: 'transparent', border: 0, borderRadius: 'var(--r)', padding: '7px 9px', cursor: 'pointer', color: 'var(--ink)' } as const,
  exportNote: { margin: 0, padding: '6px 16px', background: 'var(--acF)', borderBottom: '1px solid var(--ac)', fontSize: 12, display: 'flex', gap: 10, alignItems: 'center' } as const,
  empty: { border: '1px solid var(--rule)', background: 'var(--panel)', borderRadius: 'var(--r)', padding: '16px 18px' } as const,
  primary: { fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 12, background: 'var(--ink)', color: 'var(--bg)', border: 0, borderRadius: 'var(--r)', padding: '6px 13px', cursor: 'pointer' } as const,
  pending: { border: '1px dashed var(--ruleS)', borderRadius: 'var(--r)', padding: '16px 18px', color: 'var(--soft)', fontStyle: 'italic' } as const,
}
