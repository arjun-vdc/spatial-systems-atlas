// Candidate display: Map.
//
// Subjects and capability groups as nodes on a canvas that pans and zooms.
// Specifications sit on the left, capability groups in the middle and
// implementations on the right; colour follows the subject's family. A line
// joins a subject to a group where it has at least half of that group's rows on
// screen, and at least two, built in or through an extension. Selecting a node shows every link it
// has, with counts, and the subjects it shares the most rows with.
//
// The step strip is the use-case lane: each stop sets the same lane the sidebar
// sets, so the two can never disagree. The sidebar still scopes everything here.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Capability, LaneId, Model } from '../design-model.ts'
import { laneLabel } from '../design-model.ts'
import type { Action, AppState } from './state.ts'
import { PRESETS } from './state.ts'
import {
  GROUP_NODE, STOPS, familyOf, families, groupLinks, isProduction, isStrong, layoutMap, linkPath, peerPath, peers,
  shortName, stopSummary, subjectCounts,
} from './explore-model.ts'
import type { GroupLink, MapNode } from './explore-model.ts'
import './explore.css'

type Pick = { kind: 'subject' | 'group'; id: string }
type View = { x: number; y: number; k: number }

const PAD = { side: 24, top: 56, bottom: 24 }
const K_MIN = 0.3
const K_MAX = 2.5
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

export function MapView({ model, state, dispatch, rows, onFocusSubject, onOpenGroup }: {
  model: Model
  state: AppState
  dispatch: React.Dispatch<Action>
  rows: Capability[]
  onFocusSubject: (id: string) => void
  onOpenGroup: (id: string) => void
}) {
  const layout = useMemo(() => layoutMap(model), [model])
  const fam = useMemo(() => familyOf(model), [model])
  const famName = useMemo(() => new Map(families(model).map((f) => [f.id, f.name])), [model])
  const links = useMemo(() => groupLinks(model, state.on, rows), [model, state.on, rows])
  const rowsByGroup = useMemo(() => {
    const m = new Map<string, Capability[]>()
    for (const c of rows) m.set(c.g, [...(m.get(c.g) ?? []), c])
    return m
  }, [rows])

  const [picked, setPicked] = useState<Pick | null>(null)
  const [hover, setHover] = useState<Pick | null>(null)
  const active = picked ?? hover

  // A subject switched off, or a group with nothing on screen, stays where it is, faded.
  const on = useMemo(() => new Set(state.on), [state.on])
  const reaching = useMemo(() => new Set(links.filter((l) => l.reach > 0).map((l) => l.sid)), [links])

  const activePeers = useMemo(
    () => (active?.kind === 'subject' ? peers(model, active.id, state.on, rows) : []),
    [active, model, state.on, rows],
  )

  const peerShared = useMemo(() => new Map(activePeers.map((p) => [p.id, p.shared])), [activePeers])

  const lit = useMemo(() => {
    const s = new Set<string>()
    if (active?.kind === 'subject') {
      s.add(active.id)
      for (const l of links) if (l.sid === active.id) s.add(`g:${l.gid}`)
      for (const p of activePeers) s.add(p.id)
    } else if (active?.kind === 'group') {
      s.add(`g:${active.id}`)
      for (const l of links) if (l.gid === active.id && (l.reach > 0 || l.conflicts > 0)) s.add(l.sid)
    } else {
      for (const id of reaching) s.add(id)
      for (const gid of rowsByGroup.keys()) s.add(`g:${gid}`)
    }
    return s
  }, [active, links, activePeers, reaching, rowsByGroup])

  const drawn: Array<{ link: GroupLink; labelled: boolean }> = useMemo(() => {
    if (active?.kind === 'subject') return links.filter((l) => l.sid === active.id).map((link) => ({ link, labelled: true }))
    if (active?.kind === 'group') {
      const mine = links.filter((l) => l.gid === active.id && (l.reach > 0 || l.conflicts > 0))
      return mine.map((link) => ({ link, labelled: mine.length <= 12 }))
    }
    return links.filter(isStrong).map((link) => ({ link, labelled: false }))
  }, [active, links])

  // --- the canvas: size, fit, pan and zoom --------------------------------

  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    // A transient zero width (hidden, or mid-capture) must not redraw the map tiny.
    const ro = new ResizeObserver(([entry]) => { const w = Math.round(entry.contentRect.width); if (w >= 200) setWidth(w) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const worldW = layout.width + PAD.side * 2
  const worldH = layout.height + PAD.top + PAD.bottom
  const height = Math.round(Math.min(780, Math.max(420, width * (worldH / worldW))))
  const fit = useCallback((): View => {
    const k = Math.min(1.1, width / worldW, height / worldH)
    return { k, x: (width - layout.width * k) / 2, y: (height - (layout.height + PAD.bottom - PAD.top) * k) / 2 }
  }, [width, height, worldW, worldH, layout])

  const [view, setView] = useState<View | null>(null)
  const fitted = useRef(true)
  useEffect(() => {
    if (fitted.current) setView(fit())
  }, [fit])
  const v = view ?? fit()

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    fitted.current = false
    setView((prev) => {
      const cur = prev ?? fit()
      const k = Math.min(K_MAX, Math.max(K_MIN, cur.k * factor))
      const r = k / cur.k
      return { k, x: px - (px - cur.x) * r, y: py - (py - cur.y) * r }
    })
  }, [fit])
  const panBy = useCallback((dx: number, dy: number) => {
    fitted.current = false
    setView((prev) => {
      const cur = prev ?? fit()
      return { ...cur, x: cur.x + dx, y: cur.y + dy }
    })
  }, [fit])
  const reset = () => {
    fitted.current = true
    setView(fit())
  }

  // Pinch on a trackpad arrives as a wheel event with ctrlKey. A plain wheel is
  // left to the page, so the page still scrolls past the map.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const box = el.getBoundingClientRect()
      zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - box.left, e.clientY - box.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // Drag to pan, two fingers to pinch. Moves and releases are followed on the
  // window while a press lasts, so a drag that leaves the canvas keeps panning
  // and always ends. A press that moves more than a few pixels is a drag, and
  // the click it ends with selects nothing.
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ x: number; y: number; moved: boolean; dist: number } | null>(null)
  const suppressClick = useRef(false)
  const [dragging, setDragging] = useState(false)
  const toLocal = (clientX: number, clientY: number) => {
    const box = wrapRef.current?.getBoundingClientRect()
    return { x: clientX - (box?.left ?? 0), y: clientY - (box?.top ?? 0) }
  }
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as Element).closest('.cv-zoom')) return
    suppressClick.current = false
    pointers.current.set(e.pointerId, toLocal(e.clientX, e.clientY))
    const pts = [...pointers.current.values()]
    gesture.current = {
      x: e.clientX, y: e.clientY, moved: gesture.current?.moved ?? false,
      dist: pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
    }
  }
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const g = gesture.current
      const prev = pointers.current.get(e.pointerId)
      if (!g || !prev) return
      const now = toLocal(e.clientX, e.clientY)
      if (pointers.current.size >= 2) {
        pointers.current.set(e.pointerId, now)
        const [a, b] = [...pointers.current.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (g.dist > 0) zoomAt(dist / g.dist, (a.x + b.x) / 2, (a.y + b.y) / 2)
        g.dist = dist
        g.moved = true
        return
      }
      // Below the threshold the press point is kept, so the first pan carries the whole movement.
      if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 5) return
      if (!g.moved) {
        g.moved = true
        setDragging(true)
      }
      pointers.current.set(e.pointerId, now)
      panBy(now.x - prev.x, now.y - prev.y)
    }
    const onUp = (e: PointerEvent) => {
      if (!pointers.current.delete(e.pointerId)) return
      if (pointers.current.size === 0) {
        suppressClick.current = Boolean(gesture.current?.moved)
        gesture.current = null
        setDragging(false)
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [zoomAt, panBy])
  const wasDrag = () => suppressClick.current

  /** Toggles a node. The keyboard path skips the drag check, which only a pointer can trip. */
  const pick = (p: Pick) => setPicked((cur) => (cur && cur.kind === p.kind && cur.id === p.id ? null : p))
  const choose = (p: Pick) => {
    if (!wasDrag()) pick(p)
  }

  const onCanvasKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    const step = 60
    const centre = () => zoomAt(e.key === '-' ? 1 / 1.25 : 1.25, width / 2, height / 2)
    if (e.key === '+' || e.key === '=' || e.key === '-') centre()
    else if (e.key === '0') reset()
    else if (e.key === 'ArrowLeft') panBy(step, 0)
    else if (e.key === 'ArrowRight') panBy(-step, 0)
    else if (e.key === 'ArrowUp') panBy(0, step)
    else if (e.key === 'ArrowDown') panBy(0, -step)
    else return
    e.preventDefault()
  }
  const onRootKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && picked) {
      e.stopPropagation()
      setPicked(null)
    }
  }

  // --- drawing --------------------------------------------------------------

  const groupNode = (gid: string) => layout.byId.get(`g:${gid}`)
  const famOf = (id: string) => fam.get(id) ?? 'other'
  const nodeClass = (n: MapNode, key: string) =>
    ['cv-node', n.kind === 'group' ? 'group' : '', `cv-fam-${n.kind === 'group' ? 'groups' : famOf(n.id)}`,
      lit.has(key) ? '' : 'dim',
      n.kind === 'subject' && !on.has(n.id) ? 'off' : '',
      picked && picked.id === n.id && picked.kind === n.kind ? 'selected' : '',
    ].filter(Boolean).join(' ')

  const edgeStyle = (l: GroupLink) => {
    const share = l.rows ? l.reach / l.rows : 0
    if (l.reach === 0 && l.conflicts > 0) return { stroke: 'var(--bad)', width: 2, dash: '5 3' }
    if (l.reach === 0) return { stroke: 'var(--warn)', width: 1.2, dash: '1.5 3' }
    return { stroke: 'var(--fam)', width: 1 + share * 3.5, dash: undefined as string | undefined }
  }

  const stopIndex = STOPS.indexOf(state.lane)
  const setStop = (lane: LaneId | null) => {
    setPicked(null)
    if (lane !== state.lane) dispatch({ type: 'lane', lane })
  }

  return (
    <div className="cv-root" onKeyDown={onRootKey}>
      <nav className="cv-stops" aria-label="Stops">
        {STOPS.map((lane, i) => (
          <button key={lane ?? 'overview'} type="button" className="cv-stop" aria-pressed={state.lane === lane}
            onClick={() => setStop(lane)}>
            <strong>{lane ? `${i} · ${laneLabel(lane)}` : 'Overview'}</strong>
            <span>{lane ? laneLine(model, lane) : 'every lane'}</span>
          </button>
        ))}
      </nav>

      <div className="cv-keyline" aria-label="Key">
        {families(model).map((f) => (
          <span key={f.id} className={`cv-key cv-fam-${f.id}`}><span className="cv-swatch" />{f.name}</span>
        ))}
        <span className="cv-key">● production · ○ not yet</span>
      </div>

      <div className="cv-layout">
        <div className="cv-stage">
          <div ref={wrapRef} className={`cv-canvas${dragging ? ' dragging' : ''}`} style={{ height }}
            tabIndex={0} role="application"
            aria-label="Map of subjects and capability groups. Drag or use the arrow keys to move, plus and minus to zoom, 0 to fit."
            onPointerDown={onPointerDown} onKeyDown={onCanvasKey}
            onClick={(e) => { if (e.target === e.currentTarget || (e.target as Element).tagName === 'svg') { if (!wasDrag()) setPicked(null) } }}>
            <svg width={width} height={height}>
              <g transform={`translate(${v.x} ${v.y}) scale(${v.k})`}>
                {layout.heads.map((h) => (
                  <text key={h.family} className={`cv-head cv-fam-${h.family}`} x={h.x} y={h.y + 14}>
                    {h.name}
                  </text>
                ))}

                <g aria-hidden="true">
                  {drawn.map(({ link }) => {
                    const a = layout.byId.get(link.sid)
                    const g = groupNode(link.gid)
                    if (!a || !g) return null
                    const st = edgeStyle(link)
                    return (
                      <path key={`${link.sid}-${link.gid}`} className={`cv-edge cv-fam-${famOf(link.sid)}`} d={linkPath(a, g)}
                        stroke={st.stroke} strokeWidth={st.width} strokeDasharray={st.dash}
                        opacity={active ? 0.9 : 0.35} />
                    )
                  })}
                  {active?.kind === 'subject' && activePeers.map((p) => {
                    const a = layout.byId.get(active.id)
                    const b = layout.byId.get(p.id)
                    if (!a || !b) return null
                    return (
                      <path key={`peer-${p.id}`} className={`cv-edge cv-fam-${famOf(active.id)}`} d={peerPath(a, b)}
                        stroke="var(--fam)" strokeWidth={1.3} strokeDasharray="6 4" opacity={0.85} />
                    )
                  })}
                </g>

                {layout.nodes.map((n) => {
                  const key = n.kind === 'group' ? `g:${n.id}` : n.id
                  if (n.kind === 'group') return <GroupNode key={key} node={n} model={model} on={state.on}
                    rows={rowsByGroup.get(n.id) ?? []} className={nodeClass(n, key)}
                    onPick={() => choose({ kind: 'group', id: n.id })} onKeyPick={() => pick({ kind: 'group', id: n.id })}
                    onHover={(h) => setHover(h ? { kind: 'group', id: n.id } : null)} />
                  const s = model.bySubject.get(n.id)!
                  return (
                    <g key={key} className={nodeClass(n, key)} transform={`translate(${n.x} ${n.y})`}
                      role="button" tabIndex={0}
                      aria-label={`${s.name}, ${famName.get(famOf(n.id)) ?? ''}${on.has(n.id) ? '' : ', not in the comparison'}`}
                      aria-pressed={picked?.kind === 'subject' && picked.id === n.id}
                      onClick={() => choose({ kind: 'subject', id: n.id })}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick({ kind: 'subject', id: n.id }) } }}
                      onPointerEnter={() => setHover({ kind: 'subject', id: n.id })}
                      onPointerLeave={() => setHover(null)}>
                      <title>{`${s.name} · ${famName.get(famOf(n.id)) ?? ''} · ${s.status}`}</title>
                      <rect className="cv-box" width={n.w} height={n.h} rx={4} />
                      <rect className="cv-bar" width={3} height={n.h} rx={1.5} />
                      <text className="cv-name" x={10} y={n.h / 2 + 4}>{shortName(s.name, 24)}</text>
                      <circle cx={n.w - 10} cy={n.h / 2} r={3.2}
                        fill={isProduction(s) ? 'var(--fam)' : 'none'} stroke="var(--fam)" strokeWidth={1.2} />
                      {peerShared.has(n.id) && (
                        <g className={`cv-badge cv-fam-${famOf(active!.id)}`} transform={`translate(${n.w - 34} -8)`}>
                          <title>{`${peerShared.get(n.id)} rows on screen shared with ${model.bySubject.get(active!.id)?.name}`}</title>
                          <rect width={30} height={15} rx={7.5} />
                          <text x={15} y={11} textAnchor="middle">{peerShared.get(n.id)}</text>
                        </g>
                      )}
                    </g>
                  )
                })}

                <g aria-hidden="true">
                  {drawn.filter((d) => d.labelled).map(({ link }) => {
                    const a = layout.byId.get(link.sid)
                    const g = groupNode(link.gid)
                    if (!a || !g) return null
                    // A label sits on the half of the link nearer the group, where links fan in less.
                    const x1 = a.side === 'left' ? a.x + a.w : a.x
                    const x2 = a.side === 'left' ? g.x : g.x + g.w
                    const t = active?.kind === 'group' ? 0.3 : 0.62
                    const x = x1 + (x2 - x1) * t
                    const y = a.y + a.h / 2 + (g.y + g.h / 2 - a.y - a.h / 2) * (t < 0.5 ? 0.12 : 0.88)
                    const text = link.reach > 0
                      ? `${link.reach}/${link.rows}${link.conflicts ? ` · ${link.conflicts}c` : ''}`
                      : link.conflicts ? `${link.conflicts} conflict` : `${link.partial} partial`
                    return (
                      <text key={`l-${link.sid}-${link.gid}`} className={`cv-edge-label${link.reach === 0 && link.conflicts ? ' bad' : ''}`}
                        x={x} y={y + 3} textAnchor="middle">{text}</text>
                    )
                  })}
                </g>
              </g>
            </svg>

            <div className="cv-zoom">
              <button type="button" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.25, width / 2, height / 2)}>−</button>
              <button type="button" aria-label="Zoom in" onClick={() => zoomAt(1.25, width / 2, height / 2)}>+</button>
              <button type="button" onClick={reset}>Fit</button>
            </div>
            <span className="cv-hint">drag to move · pinch or ctrl + scroll to zoom</span>
          </div>
        </div>

        {picked?.kind === 'subject' ? (
          <SubjectCard model={model} id={picked.id} rows={rows} on={state.on} famClass={`cv-fam-${famOf(picked.id)}`}
            famName={famName.get(famOf(picked.id)) ?? ''} links={links.filter((l) => l.sid === picked.id)}
            peerList={peers(model, picked.id, state.on, rows)}
            onBack={() => setPicked(null)} onPick={(id) => setPicked({ kind: 'subject', id })}
            onFocus={() => onFocusSubject(picked.id)}
            onToggle={() => dispatch({ type: 'toggle-subject', id: picked.id })} />
        ) : picked?.kind === 'group' ? (
          <GroupCard model={model} id={picked.id} rows={rowsByGroup.get(picked.id) ?? []} on={state.on}
            onBack={() => setPicked(null)} onPick={(id) => setPicked({ kind: 'subject', id })}
            onOpen={() => onOpenGroup(picked.id)} />
        ) : (
          <StopCard model={model} lane={state.lane} index={stopIndex} rows={rows} on={state.on}
            famCount={new Set(state.on.map(famOf)).size}
            onPick={(id) => setPicked({ kind: 'subject', id })}
            onStep={(d) => setStop(STOPS[Math.min(STOPS.length - 1, Math.max(0, stopIndex + d))])} />
        )}
      </div>
    </div>
  )
}

/**
 * The stop's second line. The lane filter keeps every row that serves the use
 * case; the number the sidebar's Lane section shows counts only the rows among
 * them that must interoperate. Both are given, so neither reads as the other.
 */
function laneLine(model: Model, lane: LaneId): string {
  const rows = model.capabilities.filter((c) => c.uses.includes(lane))
  return `${rows.length} rows · ${rows.filter((c) => c.interop === 'must').length} must agree`
}

/** A capability group: its name and a bar of how far the selected subjects reach its rows on screen. */
function GroupNode({ node, model, on, rows, className, onPick, onKeyPick, onHover }: {
  node: MapNode
  model: Model
  on: string[]
  rows: Capability[]
  className: string
  onPick: () => void
  onKeyPick: () => void
  onHover: (h: boolean) => void
}) {
  const group = model.groups.find((g) => g.id === node.id)!
  const tally = { n: 0, x: 0, p: 0, none: 0 }
  for (const c of rows) {
    const levels = on.map((id) => model.cov[id]?.[c.id]?.[0])
    if (levels.includes('n')) tally.n++
    else if (levels.includes('x')) tally.x++
    else if (levels.includes('p')) tally.p++
    else tally.none++
  }
  const total = rows.length || 1
  const barW = GROUP_NODE.w - 56
  let x = 10
  const segs: Array<[number, string, string]> = [
    [tally.n, 'var(--ac)', 'somebody has it built in'],
    [tally.x, 'color-mix(in srgb, var(--ac) 45%, var(--panel))', 'only through an extension'],
    [tally.p, 'var(--warn)', 'only partial'],
    [tally.none, 'var(--rule)', 'nobody reaches it'],
  ]
  const all = model.capabilities.filter((c) => c.g === node.id).length
  return (
    <g className={className} transform={`translate(${node.x} ${node.y})`} role="button" tabIndex={0}
      aria-label={`${group.name}, ${rows.length} of ${all} rows on screen`}
      onClick={onPick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onKeyPick() } }}
      onPointerEnter={() => onHover(true)} onPointerLeave={() => onHover(false)}>
      <title>{`${group.name} · ${rows.length} of ${all} rows on screen`}</title>
      <rect className="cv-box" width={node.w} height={node.h} rx={5} />
      <text className="cv-name" x={10} y={18}>{group.name}</text>
      <text className="cv-sub" x={node.w - 10} y={35} textAnchor="end">{rows.length === all ? `${all} rows` : `${rows.length}/${all}`}</text>
      {rows.length > 0 ? segs.map(([n, fill, word], i) => {
        if (!n) return null
        const w = (n / total) * barW
        const r = <rect key={i} x={x} y={28} width={Math.max(1, w - 1)} height={7} fill={fill}><title>{`${n} rows ${word}`}</title></rect>
        x += w
        return r
      }) : <text className="cv-sub" x={10} y={34}>no rows on screen</text>}
    </g>
  )
}

function Stats({ items }: { items: Array<{ n: number | string; text: string; bad?: boolean }> }) {
  return (
    <ul className="cv-stats">
      {items.map((it) => (
        <li key={it.text}><b className={it.bad ? 'bad' : undefined}>{it.n}</b><span>{it.text}</span></li>
      ))}
    </ul>
  )
}

function StopCard({ model, lane, index, rows, on, famCount, onPick, onStep }: {
  model: Model
  lane: LaneId | null
  index: number
  rows: Capability[]
  on: string[]
  famCount: number
  onPick: (id: string) => void
  onStep: (d: number) => void
}) {
  const sum = stopSummary(model, on, rows)
  const laneRows = lane ? model.capabilities.filter((c) => c.uses.includes(lane)).length : 0
  const laneMust = lane ? model.capabilities.filter((c) => c.uses.includes(lane) && c.interop === 'must').length : 0
  const question = lane ? (PRESETS.find((p) => p.lane === lane)?.question ?? laneLabel(lane)) : 'Overview'
  const top = sum.groups[0]
  return (
    <aside className="cv-card" aria-label="About this stop">
      <span className="cv-eyebrow">
        {lane ? `Stop ${index} of ${STOPS.length - 1} · ${laneLabel(lane)}` : 'Overview · select any node'}
      </span>
      <h2>{question}</h2>
      <p>
        {lane
          ? <>{plural(laneRows, 'row')} serve the {laneLabel(lane).toLowerCase()} use case, {laneMust} of them rows that must
            {' '}interoperate. {rows.length === laneRows ? 'All' : rows.length} of the {laneRows} are on screen, across
            {' '}{plural(sum.groups.length, 'group')}{top ? <>; most sit in {top.name} ({top.rows})</> : null}.</>
          : <>{plural(on.length, 'subject')} in {plural(famCount, 'family', 'families')}, against {plural(rows.length, 'row')} in
            {' '}{plural(sum.groups.length, 'group')}. A line joins a subject to a group where it has at least half of
            {' '}that group's rows on screen, and at least two, built in or through an extension.</>}
      </p>
      <Stats items={[
        { n: sum.builtIn, text: `of ${plural(sum.rows, 'row')} are built in by at least one selected subject` },
        { n: sum.nobody, text: 'assessed, and no selected subject has them built in or through an extension', bad: sum.nobody > 0 },
        { n: sum.conflictRows, text: 'carry a recorded conflict', bad: sum.conflictRows > 0 },
        ...(sum.unassessed ? [{ n: sum.unassessed, text: 'nobody selected has assessed yet' }] : []),
      ]} />
      {sum.leaders.length > 0 && (
        <div>
          <span className="cv-eyebrow">Reaches the most rows here</span>
          <ul className="cv-list" style={{ marginTop: 4 }}>
            {sum.leaders.map((l) => (
              <li key={l.id}>
                <button type="button" className="cv-link" onClick={() => onPick(l.id)}>{model.bySubject.get(l.id)?.name}</button>
                <span>{l.reach} rows</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="cv-note">Counts use every selected subject and the rows on screen. Select a node to see all of its links.</p>
      <div className="cv-nav">
        <button type="button" className="cv-button" disabled={index <= 0} onClick={() => onStep(-1)}>← Back</button>
        <span>{index === 0 ? 'Overview' : `Stop ${index} of ${STOPS.length - 1}`}</span>
        <button type="button" className="cv-button" disabled={index >= STOPS.length - 1} onClick={() => onStep(1)}>Next →</button>
      </div>
    </aside>
  )
}

function SubjectCard({ model, id, rows, on, famClass, famName, links, peerList, onBack, onPick, onFocus, onToggle }: {
  model: Model
  id: string
  rows: Capability[]
  on: string[]
  famClass: string
  famName: string
  links: GroupLink[]
  peerList: Array<{ id: string; shared: number }>
  onBack: () => void
  onPick: (id: string) => void
  onFocus: () => void
  onToggle: () => void
}) {
  const s = model.bySubject.get(id)!
  const k = subjectCounts(model, id, rows)
  const best = [...links].filter((l) => l.reach > 0).sort((a, b) => b.reach - a.reach).slice(0, 5)
  const isOn = on.includes(id)
  return (
    <aside className={`cv-card ${famClass}`} aria-label={`About ${s.name}`}>
      <span className="cv-eyebrow">{famName} · {s.status}{s.org ? ` · ${s.org}` : ''}</span>
      <h2>{s.name}</h2>
      {s.sum && <p>{s.sum}</p>}
      <Stats items={[
        { n: k.n, text: `built in, of ${plural(k.rows, 'row')} on screen` },
        { n: k.x, text: 'through an extension' },
        { n: k.p, text: 'partial' },
        ...(k.c ? [{ n: k.c, text: 'with a recorded conflict', bad: true }] : []),
      ]} />
      <p className="cv-note">
        {k.z} absent · {k.o} out of scope · {k.never} not assessed{isOn ? '' : ' · not in the comparison, so it sends no links'}
      </p>
      {best.length > 0 && (
        <div>
          <span className="cv-eyebrow">Strongest groups</span>
          <ul className="cv-list" style={{ marginTop: 4 }}>
            {best.map((l) => (
              <li key={l.gid}><span>{model.groups.find((g) => g.id === l.gid)?.name}</span><span>{l.reach} of {l.rows}</span></li>
            ))}
          </ul>
        </div>
      )}
      {peerList.length > 0 && (
        <div>
          <span className="cv-eyebrow">Shares the most rows with</span>
          <ul className="cv-list" style={{ marginTop: 4 }}>
            {peerList.map((p) => (
              <li key={p.id}>
                <button type="button" className="cv-link" onClick={() => onPick(p.id)}>{model.bySubject.get(p.id)?.name}</button>
                <span>{p.shared} rows</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="cv-actions">
        <button type="button" className="cv-button primary" onClick={onFocus}>Put in focus →</button>
        <button type="button" className="cv-button" onClick={onToggle}>{isOn ? 'Remove from comparison' : 'Add to comparison'}</button>
      </div>
      <div className="cv-nav">
        <button type="button" className="cv-button" onClick={onBack}>← Back to the stop</button>
      </div>
    </aside>
  )
}

function GroupCard({ model, id, rows, on, onBack, onPick, onOpen }: {
  model: Model
  id: string
  rows: Capability[]
  on: string[]
  onBack: () => void
  onPick: (id: string) => void
  onOpen: () => void
}) {
  const g = model.groups.find((x) => x.id === id)!
  const all = model.capabilities.filter((c) => c.g === id).length
  const sum = stopSummary(model, on, rows)
  const h = model.health[id]
  return (
    <aside className="cv-card cv-fam-groups" aria-label={`About ${g.name}`}>
      <span className="cv-eyebrow">Capability group · {g.plane}</span>
      <h2>{g.name}</h2>
      <p>{rows.length === all ? `All ${all} rows are on screen.` : `${rows.length} of its ${all} rows are on screen.`}</p>
      <Stats items={[
        { n: sum.builtIn, text: 'built in by at least one selected subject' },
        { n: sum.nobody, text: 'assessed, and no selected subject has them built in or through an extension', bad: sum.nobody > 0 },
        { n: sum.conflictRows, text: 'carry a recorded conflict', bad: sum.conflictRows > 0 },
      ]} />
      <p className="cv-note">
        Across every subject in the snapshot: {h.contested} shared by two or more · {h.thin} held by one ·
        {' '}{h.gap} reached by nobody · {h.proto} agreed when systems connect.
      </p>
      {sum.leaders.length > 0 && (
        <div>
          <span className="cv-eyebrow">Reaches the most of it</span>
          <ul className="cv-list" style={{ marginTop: 4 }}>
            {sum.leaders.map((l) => (
              <li key={l.id}>
                <button type="button" className="cv-link" onClick={() => onPick(l.id)}>{model.bySubject.get(l.id)?.name}</button>
                <span>{l.reach} of {rows.length}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="cv-actions">
        <button type="button" className="cv-button primary" onClick={onOpen}>Open in Relationships →</button>
      </div>
      <div className="cv-nav">
        <button type="button" className="cv-button" onClick={onBack}>← Back to the stop</button>
      </div>
    </aside>
  )
}
