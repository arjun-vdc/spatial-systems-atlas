// Candidate display: Line-up, with a card that shows an image.
//
// One band per family. Every selected subject is a dot placed by how many of
// the rows on screen it reaches, so a reader sees the spread inside a family
// and between families at a glance. A filled dot counts as production, a hollow
// one does not yet, the same rule the percentages use. The card at the right
// shows the selected subject with an image and its credit, or a plain slot
// where no image with a clear free licence was found.
//
// The family chips switch a whole family on or off in the one comparison the
// sidebar also edits. There is no second list.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Capability, Model, Subject } from '../design-model.ts'
import type { Action, AppState } from './state.ts'
import { MEASURES, families, isProduction, measureValue, packDots, shortName, subjectCounts } from './explore-model.ts'
import type { Measure } from './explore-model.ts'
import { SUBJECT_IMAGES } from './subject-images.ts'
import './explore.css'

const LANE_H = 21
const BAND_TOP = 12
const BAND_BOTTOM = 10
const AXIS_H = 34
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** A label's width in pixels, estimated from its length, so labels can be packed before they are drawn. */
const labelWidth = (name: string, value: number) => name.length * 6.3 + String(value).length * 6.4 + 8

export function LineupView({ model, state, dispatch, rows, onFocusSubject }: {
  model: Model
  state: AppState
  dispatch: React.Dispatch<Action>
  rows: Capability[]
  onFocusSubject: (id: string) => void
}) {
  const [measure, setMeasure] = useState<Measure>('nx')
  const fams = useMemo(() => families(model), [model])
  const on = useMemo(() => new Set(state.on), [state.on])
  const counts = useMemo(
    () => new Map(model.subjects.map((s) => [s.id, subjectCounts(model, s.id, rows)])),
    [model, rows],
  )
  const value = (id: string) => measureValue(counts.get(id)!, measure)
  const famOfId = useMemo(() => {
    const m = new Map<string, string>()
    for (const f of fams) for (const s of f.subjects) m.set(s.id, f.id)
    return m
  }, [fams])

  // Reading order for Previous and Next: family by family, most rows first.
  const order = fams.flatMap((f) =>
    f.subjects.filter((s) => on.has(s.id)).sort((a, b) => value(b.id) - value(a.id) || a.name.localeCompare(b.name)))

  const [picked, setPicked] = useState<string | null>(null)
  const leader = [...order].sort((a, b) => value(b.id) - value(a.id))[0]?.id ?? null
  const selected = picked && on.has(picked) ? picked : leader

  // --- the chart ---------------------------------------------------------------

  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(860)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    // A transient zero width (hidden, or mid-capture) must not redraw the chart tiny.
    const ro = new ResizeObserver(([entry]) => { const w = Math.round(entry.contentRect.width); if (w >= 200) setWidth(w) })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const labelCol = width < 620 ? 104 : 150
  const x0 = labelCol + 14
  const x1 = width - 18
  const max = Math.max(1, ...order.map((s) => value(s.id)))
  const step = max <= 20 ? 5 : max <= 60 ? 10 : max <= 150 ? 25 : 50
  const top = Math.ceil(max / step) * step
  const xOf = (v: number) => x0 + (v / top) * (x1 - x0)
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step)

  const bands = fams.map((f) => {
    const members = f.subjects.filter((s) => on.has(s.id))
    const packed = packDots(members, (s) => xOf(value(s.id)), (s, x) => {
      const w = labelWidth(shortName(s.name, 26), value(s.id))
      return x + 9 + w > width - 4 ? [x - 9 - w, x + 7] : [x - 7, x + 9 + w]
    })
    const lanes = Math.max(1, ...packed.map((p) => p.lane + 1))
    return { f, members, packed, height: BAND_TOP + lanes * LANE_H + BAND_BOTTOM }
  })
  let yCursor = 0
  const placed = bands.map((b) => {
    const y = yCursor
    yCursor += b.height
    return { ...b, y }
  })
  const chartH = yCursor + AXIS_H

  const m = MEASURES.find((x) => x.id === measure)!
  const index = selected ? order.findIndex((s) => s.id === selected) : -1
  const step1 = (d: number) => {
    if (order.length === 0) return
    const next = order[(index + d + order.length) % order.length]
    setPicked(next.id)
  }

  return (
    <div className="cv-root">
      <div className="cv-toolbar">
        <div className="cv-seg" role="group" aria-label="What a dot counts">
          {MEASURES.map((x) => (
            <button key={x.id} type="button" aria-pressed={measure === x.id} onClick={() => setMeasure(x.id)}>{x.label}</button>
          ))}
        </div>
        <div className="cv-chips" role="group" aria-label="Families in the comparison">
          {fams.map((f) => {
            const n = f.subjects.filter((s) => on.has(s.id)).length
            const all = n === f.subjects.length
            return (
              <button key={f.id} type="button" className={`cv-chip cv-fam-${f.id}${n && !all ? ' part' : ''}`}
                aria-pressed={all} title={all ? `Remove every ${f.name} subject from the comparison` : `Add every ${f.name} subject to the comparison`}
                onClick={() => {
                  const ids = f.subjects.map((s) => s.id)
                  dispatch({ type: 'set-on', on: all ? state.on.filter((id) => !ids.includes(id)) : [...new Set([...state.on, ...ids])] })
                }}>
                <span className="cv-swatch" />{f.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="cv-layout">
        <div className="cv-stage" style={{ padding: '10px 6px 6px' }}>
          <div className="cv-keyline" style={{ padding: '0 8px' }}>
            <span className="cv-key">Rows on screen {m.word}, of {rows.length}</span>
            <span className="cv-key">● production · ○ not yet</span>
          </div>
          <div ref={wrapRef}>
            <svg width={width} height={chartH} role="img"
              aria-label={`${plural(order.length, 'subject')} placed by rows ${m.word}, in ${fams.length} families`}>
              <g className="cv-axis">
                {ticks.map((t) => (
                  <g key={t}>
                    <line x1={xOf(t)} x2={xOf(t)} y1={0} y2={yCursor} strokeDasharray={t === 0 ? undefined : '2 4'} />
                    <text x={xOf(t)} y={yCursor + 16} textAnchor="middle">{t}</text>
                  </g>
                ))}
                <text x={x1} y={yCursor + 30} textAnchor="end">rows {m.word}</text>
              </g>

              {placed.map(({ f, members, packed, y, height }) => (
                <g key={f.id} className={`cv-fam-${f.id}`} transform={`translate(0 ${y})`}>
                  <line className="cv-band-rule" x1={8} x2={width - 8} y1={height} y2={height} />
                  <text className="cv-band-name" x={10} y={BAND_TOP + 12}>{shortName(f.name, width < 620 ? 14 : 22)}</text>
                  <text className="cv-band-sub" x={10} y={BAND_TOP + 25}>
                    {members.length === f.subjects.length ? plural(members.length, 'subject') : `${members.length} of ${f.subjects.length} on`}
                  </text>
                  {members.length === 0 && (
                    <text className="cv-empty-band" x={x0 + 4} y={BAND_TOP + 14}>none in the comparison</text>
                  )}
                  {packed.map(({ item: s, x, lane }) => (
                    <Dot key={s.id} subject={s} x={x} y={BAND_TOP + lane * LANE_H + 8} value={value(s.id)}
                      left={x + 9 + labelWidth(shortName(s.name, 26), value(s.id)) > width - 4}
                      selected={s.id === selected} onPick={() => setPicked(s.id)} />
                  ))}
                </g>
              ))}
            </svg>
          </div>
        </div>

        {selected ? (
          <ImageCard subject={model.bySubject.get(selected)!} famId={famOfId.get(selected) ?? 'other'}
            famName={fams.find((f) => f.id === famOfId.get(selected))?.name ?? ''}
            counts={counts.get(selected)!} measure={measure} index={index} total={order.length}
            onStep={step1} onFocus={() => onFocusSubject(selected)} />
        ) : (
          <aside className="cv-card"><p>No subject is in the comparison.</p></aside>
        )}
      </div>
    </div>
  )
}

function Dot({ subject, x, y, value, left, selected, onPick }: {
  subject: Subject
  x: number
  y: number
  value: number
  left: boolean
  selected: boolean
  onPick: () => void
}) {
  const name = shortName(subject.name, 26)
  return (
    <g className={`cv-dot${selected ? ' selected' : ''}`} role="button" tabIndex={0}
      aria-label={`${subject.name}, ${value} rows`} aria-pressed={selected}
      onClick={onPick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick() } }}>
      <title>{`${subject.name} · ${value} rows · ${subject.status}`}</title>
      <circle className="ring" cx={x} cy={y} r={9.5} />
      <circle className="mark" cx={x} cy={y} r={5.5} fill={isProduction(subject) ? 'var(--fam)' : 'var(--panel)'} />
      <text x={left ? x - 10 : x + 10} y={y + 4} textAnchor={left ? 'end' : 'start'}>
        {name} <tspan className="v">{value}</tspan>
      </text>
    </g>
  )
}

function ImageCard({ subject, famId, famName, counts, measure, index, total, onStep, onFocus }: {
  subject: Subject
  famId: string
  famName: string
  counts: ReturnType<typeof subjectCounts>
  measure: Measure
  index: number
  total: number
  onStep: (d: number) => void
  onFocus: () => void
}) {
  const image = SUBJECT_IMAGES[subject.id]
  const [failed, setFailed] = useState<string | null>(null)
  const showImage = image && failed !== subject.id
  const m = MEASURES.find((x) => x.id === measure)!
  const v = measureValue(counts, measure)
  const kindWord = image?.kind === 'screenshot' ? 'Screenshot' : image?.kind === 'diagram' ? 'Diagram' : 'Logo'

  return (
    <aside className={`cv-card cv-fam-${famId}`} aria-label={`About ${subject.name}`}>
      <figure className="cv-figure">
        <div className={`cv-image${showImage && image.kind === 'logo' ? ' logo' : ''}`}>
          {showImage ? (
            <img key={image.src} src={image.src} alt={image.what} loading="lazy" referrerPolicy="no-referrer"
              onError={() => setFailed(subject.id)} />
          ) : (
            <div className="cv-plain">
              <span className="cv-eyebrow">{famName}</span>
              <b>{v}</b>
              <small>rows {m.word}{image ? ' · the image did not load' : ''}</small>
            </div>
          )}
        </div>
        {showImage && (
          <figcaption className="cv-credit">
            {kindWord}: {image.author} ·{' '}
            {image.licenceUrl ? <a href={image.licenceUrl} target="_blank" rel="noreferrer">{image.licence}</a> : image.licence}
            {image.trademark ? ' · trademark of its owner' : ''}, via{' '}
            <a href={image.page} target="_blank" rel="noreferrer">Wikimedia Commons</a>
          </figcaption>
        )}
      </figure>

      <span className="cv-eyebrow">{subject.status}{subject.version ? ` · ${subject.version}` : ''}</span>
      <h2>{subject.name}</h2>
      <div className="cv-tags">
        <span className="cv-tag fam">{famName}</span>
        <span className="cv-tag">{isProduction(subject) ? 'Counts as production' : 'Not yet production'}</span>
      </div>

      <ul className="cv-stats">
        <li><b>{counts.n}</b><span>built in, of {counts.rows} rows on screen</span></li>
        <li><b>{counts.x}</b><span>through an extension</span></li>
        <li><b>{counts.p}</b><span>partial</span></li>
        {counts.c > 0 && <li><b className="bad">{counts.c}</b><span>with a recorded conflict</span></li>}
      </ul>

      <dl className="cv-kv">
        {subject.org && <><dt>Organisation</dt><dd>{subject.org}</dd></>}
        {subject.licence && <><dt>Licence</dt><dd>{subject.licence}</dd></>}
        <dt>Kind</dt><dd>{subject.kind}</dd>
      </dl>
      {subject.sum && <p>{subject.sum}</p>}
      <p className="cv-note">{counts.z} absent · {counts.o} out of scope · {counts.never} not assessed, on the rows on screen.</p>

      <div className="cv-actions">
        <button type="button" className="cv-button primary" onClick={onFocus}>Put in focus →</button>
        {subject.url && <a className="cv-button" href={subject.url} target="_blank" rel="noreferrer">Its own site</a>}
      </div>
      <div className="cv-nav">
        <button type="button" className="cv-button" onClick={() => onStep(-1)} disabled={total < 2}>← Previous</button>
        <span>{index + 1} / {total}</span>
        <button type="button" className="cv-button" onClick={() => onStep(1)} disabled={total < 2}>Next →</button>
      </div>
    </aside>
  )
}
