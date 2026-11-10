// The Compare display: one aligned grid. Capabilities down, selected subjects
// across, with the group headings kept as rows so a reader never loses which
// part of the map they are in.
//
// Keyboard: arrow keys move between cells, Enter opens the row, Home and End
// jump to the start and end of a row. The grid is a single tab stop, so tabbing
// past it does not mean pressing tab 800 times.
//
// The table is two panes side by side: the capability names, which never scroll
// sideways, and the subject columns, which scroll both ways. The horizontal
// scrollbar then spans the subject columns alone and no cell passes under a name.
// The subject pane takes its row heights from the name pane, so wrapped names stay
// level with their cells, and the two panes scroll up and down together.

import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import type { Capability, Model } from '../design-model.ts'
import { inLane } from '../design-model.ts'
import { cellStyle, describe, read } from './marks.ts'
import type { Action, AppState } from './state.ts'

type Row =
  | { kind: 'group'; id: string; name: string }
  | { kind: 'capability'; id: string; capability: Capability }

export function CompareView({ model, state, dispatch, rows }: {
  model: Model
  state: AppState
  dispatch: React.Dispatch<Action>
  rows: Capability[]
}) {
  const columns = state.on
  const [cursor, setCursor] = useState<{ row: number; col: number }>({ row: 0, col: 0 })
  const gridRef = useRef<HTMLDivElement>(null)
  const namesRef = useRef<HTMLDivElement>(null)
  const nameGridRef = useRef<HTMLDivElement>(null)
  const cellsRef = useRef<HTMLDivElement>(null)
  const uid = useId()
  // The name pane's row heights, which the subject pane copies; the column
  // headers' height, which the name pane's corner copies; and the height of the
  // subject pane's horizontal scrollbar, which the name pane leaves below its last
  // row so both panes scroll the same distance.
  const [fit, setFit] = useState({ rows: '', head: 0, bar: 0 })

  // Group headings become rows, so the grid stays one aligned table.
  const laidOut: Row[] = []
  for (const group of model.groups) {
    const groupRows = rows.filter((c) => c.g === group.id)
    if (groupRows.length === 0) continue
    laidOut.push({ kind: 'group', id: group.id, name: group.name })
    for (const c of groupRows) laidOut.push({ kind: 'capability', id: c.id, capability: c })
  }

  const capabilityRows = laidOut.filter((r): r is Extract<Row, { kind: 'capability' }> => r.kind === 'capability')

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const lastRow = capabilityRows.length - 1
    const lastCol = columns.length - 1
    let { row, col } = cursor
    switch (e.key) {
      case 'ArrowDown': row = Math.min(row + 1, lastRow); break
      case 'ArrowUp': row = Math.max(row - 1, 0); break
      case 'ArrowRight': col = Math.min(col + 1, lastCol); break
      case 'ArrowLeft': col = Math.max(col - 1, 0); break
      case 'Home': col = 0; break
      case 'End': col = lastCol; break
      case 'Enter':
      case ' ': {
        const target = capabilityRows[row]
        if (target) dispatch({ type: 'detail', detail: { cid: target.capability.id, sid: columns[col] ?? null } })
        e.preventDefault()
        return
      }
      default: return
    }
    e.preventDefault()
    setCursor({ row, col })
    gridRef.current?.querySelector<HTMLElement>(`[data-cell="${row}-${col}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [capabilityRows, columns, cursor, dispatch])

  useLayoutEffect(() => {
    const names = nameGridRef.current
    const cells = cellsRef.current
    if (!names || !cells) return
    const measure = () => {
      const heads = cells.querySelectorAll<HTMLElement>('[role="columnheader"]')
      const head = Math.max(0, ...Array.from(heads, (h) => h.scrollHeight))
      // The corner takes the headers' height before the rows are read, so they are read once, right.
      const corner = names.querySelector<HTMLElement>('[role="columnheader"]')
      if (corner) corner.style.minHeight = `${head}px`
      // A grid container's computed row template is its rows' used heights in pixels.
      const rows = getComputedStyle(names).gridTemplateRows
      const bar = cells.offsetHeight - cells.clientHeight
      setFit((f) => (f.rows === rows && f.head === head && f.bar === bar ? f : { rows, head, bar }))
    }
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(names)
    watch.observe(cells)
    return () => watch.disconnect()
  }, [rows, columns, state.lane])

  // Up and down, the two panes move together, whichever one the reader scrolls.
  const follow = (from: HTMLDivElement | null, to: HTMLDivElement | null) => {
    if (from && to && to.scrollTop !== from.scrollTop) to.scrollTop = from.scrollTop
  }

  if (columns.length === 0) return null

  const template = `repeat(${columns.length}, minmax(74px,1fr))`
  const cellId = (row: number | 'head', col: number) => `${uid}-${row}-${col}`

  return (
    <section style={s.panel}>
      <div style={s.head}>
        <span style={s.eyebrow}>Compare</span>
        <span style={s.hint}>
          {rows.length} rows × {columns.length} {columns.length === 1 ? 'subject' : 'subjects'} · arrow keys move, Enter opens the row
          {columns.length > 10 && ' · scroll right for more'}
        </span>
      </div>

      <div ref={gridRef} role="grid" tabIndex={0} onKeyDown={onKeyDown}
        aria-label="Capabilities by subject" style={s.frame}>

        <div ref={namesRef} style={{ ...s.names, paddingBottom: fit.bar }}
          onScroll={() => follow(namesRef.current, cellsRef.current)}>
          <div ref={nameGridRef} style={s.nameGrid}>
            <div role="row" aria-owns={columns.map((_, col) => cellId('head', col)).join(' ')} style={{ display: 'contents' }}>
              <div style={{ ...s.corner, minHeight: fit.head }} role="columnheader">Capability</div>
            </div>
            {laidOut.map((entry) => {
              if (entry.kind === 'group') {
                return (
                  <div key={`g-${entry.id}`} role="row" style={s.groupRow}>
                    <button type="button" style={s.groupButton}
                      title="Open this group in the Relationships display"
                      onClick={() => { dispatch({ type: 'rel-group', id: entry.id }); dispatch({ type: 'view', view: 'relations' }) }}>
                      {entry.name}
                    </button>
                  </div>
                )
              }
              const c = entry.capability
              const rowIndex = capabilityRows.findIndex((r) => r.id === c.id)
              return (
                <div key={c.id} style={{ display: 'contents' }} role="row"
                  aria-owns={columns.map((_, col) => cellId(rowIndex, col)).join(' ')}>
                  <button type="button" style={s.rowHead} role="rowheader"
                    title="Open this whole row, across every compared subject"
                    onClick={() => dispatch({ type: 'detail', detail: { cid: c.id, sid: null } })}>
                    <span style={{ flex: 1, textAlign: 'left' }}>{c.name}</span>
                    {c.interop === 'must' && <span style={s.must}>must</span>}
                    {state.lane && inLane(c, state.lane) && <span style={s.lane}>lane</span>}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div ref={cellsRef} style={s.cells} onScroll={() => follow(cellsRef.current, namesRef.current)}>
          <div role="presentation" style={{ ...s.grid, gridTemplateColumns: template, gridTemplateRows: fit.rows || undefined }}>
            {columns.map((id, col) => {
              const subject = model.bySubject.get(id)
              return (
                <div key={id} id={cellId('head', col)} role="columnheader" style={s.colHead} title={`${subject?.name} · reach ${subject?.reach} rows`}>
                  <span style={s.colName} title={subject?.name}>{subject?.name ?? id}</span>
                  <span style={s.colReach}>{subject?.reach}</span>
                </div>
              )
            })}

            {laidOut.map((entry) => {
              if (entry.kind === 'group') {
                return <div key={`g-${entry.id}`} role="presentation" style={{ ...s.groupRow, gridColumn: `1 / span ${columns.length}` }} />
              }
              const c = entry.capability
              const rowIndex = capabilityRows.findIndex((r) => r.id === c.id)
              return (
                <div key={c.id} style={{ display: 'contents' }} role="presentation">
                  {columns.map((sid, colIndex) => {
                    const code = model.cov[sid]?.[c.id]
                    const focused = cursor.row === rowIndex && cursor.col === colIndex
                    return (
                      <button key={sid} type="button" role="gridcell" id={cellId(rowIndex, colIndex)} data-cell={`${rowIndex}-${colIndex}`}
                        title={describe(code, model.bySubject.get(sid)?.name ?? sid, c.name)}
                        style={{
                          ...cellStyle(code, 22),
                          width: '100%',
                          outline: focused ? '2px solid var(--ink)' : 'none',
                          outlineOffset: focused ? '-2px' : 0,
                        }}
                        onClick={() => { setCursor({ row: rowIndex, col: colIndex }); dispatch({ type: 'detail', detail: { cid: c.id, sid } }) }}>
                        {read(code).glyph}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

const s = {
  panel: { border: '1px solid var(--rule)', background: 'var(--panel)', borderRadius: 'var(--r)', padding: '10px 14px 14px' } as const,
  head: { display: 'flex', alignItems: 'baseline', gap: 10, borderBottom: '1px solid var(--rule)', paddingBottom: 6, marginBottom: 8, flexWrap: 'wrap' } as const,
  eyebrow: { fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  hint: { fontSize: 11.5, color: 'var(--faint)', fontStyle: 'italic' } as const,
  frame: { display: 'flex', alignItems: 'flex-start' } as const,
  // The name pane scrolls up and down only, with its own scrollbar hidden: the subject pane's stands for both.
  names: { flex: '0 0 auto', width: 'clamp(150px, 30%, 280px)', boxSizing: 'border-box', paddingRight: 2, maxHeight: '70vh', overflowX: 'hidden', overflowY: 'auto', scrollbarWidth: 'none' } as const,
  nameGrid: { display: 'grid', gap: 2, gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'stretch' } as const,
  cells: { flex: 1, minWidth: 0, maxHeight: '70vh', overflow: 'auto' } as const,
  grid: { display: 'grid', gap: 2, alignItems: 'stretch', minWidth: 'fit-content' } as const,
  corner: { position: 'sticky', top: 0, zIndex: 3, boxSizing: 'border-box', background: 'var(--sunk)', fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--faint)', padding: '6px 8px' } as const,
  colHead: { position: 'sticky', top: 0, zIndex: 2, boxSizing: 'border-box', background: 'var(--sunk)', padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', textAlign: 'center' } as const,
  colName: { fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 10.5, lineHeight: 1.15, maxWidth: '11ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } as const,
  colReach: { fontFamily: 'var(--fm)', fontSize: 9, color: 'var(--faint)' } as const,
  groupRow: { background: 'var(--sunk)', borderTop: '1px solid var(--ruleS)' } as const,
  groupButton: { background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', padding: '5px 8px', color: 'var(--ink)' } as const,
  rowHead: { minHeight: 22, boxSizing: 'border-box', background: 'var(--panel)', display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', border: 0, borderBottom: '1px solid var(--rule)', cursor: 'pointer', fontSize: 12, color: 'var(--ink)', textAlign: 'left' } as const,
  must: { fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--warn)', border: '1px solid var(--warn)', borderRadius: 'var(--r)', padding: '0 3px' } as const,
  lane: { fontFamily: 'var(--fm)', fontSize: 8, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--lane)', border: '1px solid var(--lane)', borderRadius: 'var(--r)', padding: '0 3px' } as const,
}
