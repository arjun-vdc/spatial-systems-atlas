// The Interop display: which parts two systems must agree on already have a
// standard in use by shipping products, and which do not yet.
//
// One screen per click: the figures and one diverging bar per use case first,
// then one use case's parts, then a part in the row panel, then a standard, then
// a product's evidence. Every number is counted from the snapshot by
// together-model.ts; nothing here is typed in.

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import type { Model } from '../design-model.ts'
import { confOf, laneLabel, levelOf } from '../design-model.ts'
import { ROW_SHEET } from './RowPanel.tsx'
import type { Action, AppState } from './state.ts'
import {
  STATUS_ORDER, WIDE_DEFAULT, buildTogether, chartScale, figures, findings, fullName, inUse, kindWord,
  notInUse, partFigure, partsOf, plural, scopeName, scopePlain, shortName, statusOf, statusWords, tally, verdict,
} from './together-model.ts'
import type { Scope, Together, TogetherStatus } from './together-model.ts'
import './together.css'

/** One count per model, shared by the figures, the display, the key and the panel. */
const cache = new WeakMap<Model, Together>()
function togetherOf(model: Model): Together {
  let t = cache.get(model)
  if (!t) { t = buildTogether(model); cache.set(model, t) }
  return t
}

/** The use case on screen, every part, or null for the first screen. */
const scopeOf = (state: AppState): Scope | null => state.lane ?? (state.wtAll ? 'all' : null)

const Swatch = ({ k, title }: { k: TogetherStatus; title?: string }) => (
  <span className="wt-sw" style={{ background: `var(--s-${k})` }} aria-hidden={title ? undefined : true} title={title} />
)

/** The heading of the display, for the question bar. */
export const TOGETHER_QUESTION = 'Where can things already work together, and where not yet?'

/** The four figures under the question: figures to read, not controls, as in the Subject view. */
export function TogetherFigures({ model, state }: { model: Model; state: AppState }) {
  if (!model.detLoaded) return null
  const t = togetherOf(model)
  const scope = state.lane ?? 'all'
  const f = figures(partsOf(t, model, scope), WIDE_DEFAULT)
  const figs: Array<[number, string, string]> = [
    [f.parts, scope === 'all' ? 'parts two systems must agree on' : 'parts this use case needs agreed', 'var(--ink)'],
    [f.inUse, 'with a standard in use', 'var(--s-rivals)'],
    [f.shared, 'with one shared standard', 'var(--s-agreed)'],
    [f.notInUse, 'with no standard in use', 'var(--s-paper)'],
  ]
  return (
    <div className="wt-root wt-figs" role="group" aria-label={`${scopeName(scope)} in figures`}>
      {figs.map(([n, label, colour]) => (
        <div key={label} className="wt-fig" data-fig={label}><b style={{ color: colour }}>{n}</b><span>{label}</span></div>
      ))}
    </div>
  )
}

export function TogetherView({ model, state, dispatch }: {
  model: Model
  state: AppState
  dispatch: React.Dispatch<Action>
}) {
  const root = useRef<HTMLDivElement>(null)
  const [table, setTable] = useState(false)
  const [tip, setTip] = useState<{ text: string; x: number; y: number; below: boolean } | null>(null)
  const scope = scopeOf(state)
  const wide = WIDE_DEFAULT

  // A count is printed on a block only where it fits; the tip, the list and the table carry it otherwise.
  useLayoutEffect(() => {
    const fit = () => root.current?.querySelectorAll<HTMLElement>('.wt-segm').forEach((el) => {
      const n = el.dataset.v ?? ''
      el.dataset.fits = el.clientWidth >= n.length * 7 + 8 ? 'yes' : 'no'
    })
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  })

  // Opening a use case moves focus to its heading; going back returns it to the use case's name in the chart.
  const before = useRef<Scope | null>(scope)
  useEffect(() => {
    const was = before.current
    before.current = scope
    if (was === scope) return
    if (scope) root.current?.querySelector<HTMLElement>('#wt-lane-title')?.focus({ preventScroll: true })
    else if (was) root.current?.querySelector<HTMLElement>(`.wt-clab[data-scope="${was}"]`)?.focus({ preventScroll: true })
  }, [scope])

  useEffect(() => {
    if (!tip) return
    const hide = () => setTip(null)
    window.addEventListener('scroll', hide, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', hide, { capture: true })
  }, [tip])

  if (!model.detLoaded) {
    return (
      <div className="wt-root wt-card" role="status">
        <p className="wt-quiet" style={{ margin: 0 }}>Loading which standards each product uses. Every count here is drawn from it.</p>
      </div>
    )
  }

  const t = togetherOf(model)
  const np = t.products.length
  const words = statusWords(np, wide)
  const [L, R] = chartScale(model, t, wide)
  const bars: Array<[Scope, string, string]> = [
    ['all', 'All use cases', `${t.parts.length} distinct parts`],
    ...t.lanes.map((lane): [Scope, string, string] => [lane, laneLabel(lane), plural(partsOf(t, model, lane).length, 'part')]),
  ]
  const open = (next: Scope, status: TogetherStatus | null = null) =>
    dispatch({ type: 'together', patch: next === 'all' ? { lane: null, wtAll: true, wtStatus: status } : { lane: next, wtAll: false, wtStatus: status } })
  const back = () => dispatch({ type: 'together', patch: { lane: null, wtAll: false, wtStatus: null } })
  const openPart = (cid: string) => dispatch({ type: 'detail', detail: { cid, sid: null } })
  const showTip = (text: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    const x = Math.max(138, Math.min(window.innerWidth - 138, r.left + r.width / 2))
    setTip({ text, x, y: r.top < 70 ? r.bottom + 6 : r.top - 6, below: r.top < 70 })
  }

  /** One diverging bar: on each side the block nearest the centre line is the weakest. */
  const barRow = (id: Scope, label: string, n: string, filter: boolean): ReactNode => {
    const parts = partsOf(t, model, id)
    const tl = tally(parts, wide)
    const side = (left: boolean) => {
      const order: TogetherStatus[] = left ? ['some', 'rivals', 'agreed'] : ['own', 'paper', 'none']
      const present = order.filter((k) => tl[k])
      const max = left ? L : R
      return (
        <div className={`wt-side ${left ? 'l' : 'r'}`}>
          {present.map((k, i) => {
            const v = tl[k]
            const on = filter && state.wtStatus === k
            const dim = filter && state.wtStatus && !on
            const tipText = `${label}: ${plural(v, 'part')} — ${words[k].word.toLowerCase()}. ${filter
              ? (on ? 'Click to show every status.' : `Click to show only ${v === 1 ? 'it' : 'these'}.`)
              : `Click to list ${v === 1 ? 'it' : 'them'}.`}`
            return (
              <button key={k} type="button" className={`wt-segm${i === present.length - 1 ? ' end' : ''}${dim ? ' dim' : ''}`}
                data-scope={id} data-status={k} data-v={String(v)}
                aria-pressed={filter ? on : undefined} tabIndex={filter ? undefined : -1} aria-label={tipText}
                style={{ width: `calc(${(v / max) * 100}% - 2px)`, background: `var(--s-${k})`, color: `var(--t-${k})` }}
                onMouseEnter={(e) => showTip(tipText, e.currentTarget)} onMouseLeave={() => setTip(null)}
                onClick={() => {
                  setTip(null)
                  if (filter) dispatch({ type: 'together', patch: { wtStatus: on ? null : k } })
                  else open(id, k)
                }}>
                <span className="wt-n">{v}</span>
              </button>
            )
          })}
          <span className="wt-endlab">{left ? inUse(tl) : notInUse(tl)}</span>
        </div>
      )
    }
    return (
      <>
        {!filter && (
          <button type="button" className="wt-clab" data-scope={id} aria-current={scope === id ? true : undefined}
            aria-label={`${label}: ${inUse(tl)} of ${parts.length} parts have a standard in use, ${notInUse(tl)} have none. List them.`}
            onClick={() => open(id)}>
            <b>{label} <span aria-hidden="true" className="chev">›</span></b><span>{n}</span>
          </button>
        )}
        {side(true)}<span className="wt-mid" />{side(false)}
      </>
    )
  }

  let body: ReactNode
  if (!scope) {
    const fd = findings(model, t, wide)
    const none = (x: { own: number; paper: number; none: number }) => x.own + x.paper + x.none
    body = (
      <>
        <section className="wt-card" aria-labelledby="wt-chart-title">
          <div className="wt-chart-head">
            <h3 id="wt-chart-title">Parts that two systems must agree on, by use case</h3>
            <span className="mono">Each block is a number of parts. Left of the line, at least one shipping product uses a standard for the part; right, none does.</span>
          </div>
          {table ? (
            <table className="wt-nums">
              <caption className="wt-sr">Parts by use case and status</caption>
              <thead><tr><th scope="col">Use case</th>{STATUS_ORDER.map((k) => <th key={k} scope="col">{words[k].word}</th>)}<th scope="col">Parts</th></tr></thead>
              <tbody>
                {bars.map(([id, label]) => {
                  const parts = partsOf(t, model, id)
                  const tl = tally(parts, wide)
                  return (
                    <tr key={id}>
                      <th scope="row"><button type="button" className="wt-link" onClick={() => open(id)}>{label}</button></th>
                      {STATUS_ORDER.map((k) => <td key={k}>{tl[k]}</td>)}
                      <td>{parts.length}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="wt-grid" style={{ '--L': `${L}fr`, '--R': `${R}fr` } as CSSProperties}>
              <span className="wt-axis lab" /><span className="wt-axis l">← a standard is in use</span><span className="wt-mid" /><span className="wt-axis r">no standard in use →</span>
              {bars.map(([id, label, n]) => (
                <Fragment key={id}>{barRow(id, label, n, false)}{id === 'all' && <span className="wt-rowsep" />}</Fragment>
              ))}
            </div>
          )}
          <div className="wt-chart-foot">
            <span className="mono">Pick a use case or a block to list its parts. A part can matter to several use cases, so the use-case bars add up to {t.lanes.reduce((a, lane) => a + partsOf(t, model, lane).length, 0)}, not {t.parts.length}.</span>
            <button type="button" className="wt-link" aria-pressed={table} onClick={() => setTable(!table)}>
              {table ? 'Show the chart' : 'Show the numbers as a table'}
            </button>
          </div>
        </section>
        <div className="wt-finds">
          {fd.travel && (
            <button type="button" className="wt-card wt-find" onClick={() => open('U3')}>
              <b>Travel between worlds and agents joining a world: {fd.travel.u3.agreed + fd.travel.u4.agreed === 0
                ? 'no part has one shared standard'
                : `${plural(fd.travel.u3.agreed + fd.travel.u4.agreed, 'part has', 'parts have')} one shared standard`}</b>
              <span className="t">{laneLabel('U3')}: {fd.travel.u3.agreed} of {fd.travel.u3n} parts, and {none(fd.travel.u3)} with no standard in use. {laneLabel('U4')}: {fd.travel.u4.agreed} of {fd.travel.u4n}, and {none(fd.travel.u4)} with none in use.</span>
              <span className="go">Open {laneLabel('U3').toLowerCase()} →</span>
            </button>
          )}
          {fd.commerce && (
            <button type="button" className="wt-card wt-find" data-part="commerce.entitlement" onClick={() => openPart('commerce.entitlement')}>
              <b>Licences and payments: many products do them, {fd.commerce.standards === 0 ? 'no standard covers them' : `${plural(fd.commerce.standards, 'standard covers', 'standards cover')} them`}</b>
              <span className="t">{fd.commerce.entitlement} of {np} shipping products check entitlements and licences, and {fd.commerce.payment} take machine or agent payments, each its own way. A purchase cannot follow a person from one product to another.</span>
              <span className="go">Open entitlements →</span>
            </button>
          )}
          <button type="button" className="wt-card wt-find" onClick={() => open('all', 'paper')}>
            <b>{plural(fd.paper.n, 'part has', 'parts have')} a standard that no shipping product does</b>
            {fd.paper.example && (
              <span className="t">For example {fd.paper.example.cap.name.toLowerCase()}: {fd.paper.example.std.map((x) => shortName(model, x.id)).join(', ')} {fd.paper.example.std.length === 1 ? 'covers' : 'cover'} it, and {fd.paper.example.doers.length} of {np} shipping products do it at all.</span>
            )}
            <span className="go">List the {plural(fd.paper.n, 'part')} →</span>
          </button>
        </div>
      </>
    )
  } else {
    const parts = partsOf(t, model, scope)
    const tl = tally(parts, wide)
    const what: Record<TogetherStatus, string> = {
      agreed: 'standard · products using it', rivals: 'products using each', some: 'standard · products using it',
      own: 'products doing it', paper: 'standards covering it', none: '',
    }
    body = (
      <section className="wt-card" aria-labelledby="wt-lane-title">
        <div className="wt-lanehead">
          <h3 id="wt-lane-title" tabIndex={-1}>{scopeName(scope)}</h3>
          <span className="plain">{scopePlain(scope)}</span>
          <button type="button" className="wt-link" onClick={back}>← Back to every use case</button>
        </div>
        <div className="wt-grid wt-lanebar" style={{ '--L': `${L}fr`, '--R': `${R}fr` } as CSSProperties}>
          <span className="wt-axis l">← a standard is in use</span><span className="wt-mid" /><span className="wt-axis r">no standard in use →</span>
          {barRow(scope, scopeName(scope), '', true)}
        </div>
        {state.wtStatus ? (
          <p className="wt-filterline">Showing only: <Swatch k={state.wtStatus} /> <b>{words[state.wtStatus].word}</b> ({tl[state.wtStatus]}).{' '}
            <button type="button" className="wt-link" onClick={() => dispatch({ type: 'together', patch: { wtStatus: null } })}>Show every status</button></p>
        ) : (
          <p className="wt-filterline">Pick a part to see its standards and who uses them. Pick a block in the bar to show one status.</p>
        )}
        {parts.length === 0 && <p className="wt-quiet">No part of this use case must be agreed between two systems.</p>}
        <div className="wt-cols">
          {STATUS_ORDER.filter((k) => !state.wtStatus || state.wtStatus === k).map((k) => {
            const list = parts.filter((p) => statusOf(p, wide) === k)
            if (!list.length) return null
            return (
              <div key={k} className="wt-grp" data-status={k}>
                <h4><Swatch k={k} />{words[k].word} <span className="n">{list.length}</span>{what[k] && <span className="rule">· {what[k]}</span>}</h4>
                {list.map((p) => (
                  <button key={p.cap.id} type="button" className="wt-prow" data-part={p.cap.id}
                    aria-expanded={state.detail?.cid === p.cap.id} aria-haspopup="dialog" onClick={() => openPart(p.cap.id)}>
                    <span className="nm">{p.cap.name}</span><span className="fg">{partFigure(model, t, p, wide)}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <div ref={root} className="wt-root wt-content" data-together={scope ?? 'chart'}>
      {body}
      {tip && (
        <div className="wt-tip" role="tooltip"
          style={{ left: tip.x, top: tip.y, transform: `translate(-50%, ${tip.below ? '0' : '-100%'})` }}>{tip.text}</div>
      )}
    </div>
  )
}

/** This display's key in the "Reading the marks" column. "Widely used" is fixed; each status line says it. */
export function TogetherLegend({ model, open, toggle, narrow }: {
  model: Model
  open: boolean
  toggle: () => void
  narrow: boolean
}) {
  const ready = model.detLoaded
  const t = togetherOf(model)
  const np = t.products.length
  const wide = WIDE_DEFAULT
  const words = statusWords(np, wide)
  const tl = tally(t.parts, wide)
  return (
    <aside aria-label="Reading the marks" className={`wt-root wt-legend${narrow ? ' strip' : ''}${open ? '' : ' shut'}`}>
      <button type="button" className="lgt full" aria-expanded={open} onClick={toggle}>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>
          <path d="M3 1.5L7 5L3 8.5z" fill="currentColor" />
        </svg>
        <span className={open ? 'tiny' : 'wt-sr'}>Reading the marks</span>
      </button>
      {STATUS_ORDER.map((k) => (
        <div key={k} className="e" data-status={k}>
          <Swatch k={k} title={open ? undefined : `${words[k].word}: ${words[k].line}`} />
          <span><strong>{words[k].word}{ready ? ` · ${tl[k]}` : ''}</strong><span className="d">{words[k].line}</span></span>
        </div>
      ))}
    </aside>
  )
}

const LEVEL_WORD: Record<string, string> = {
  n: 'Built in', x: 'Through an extension', p: 'Partly', c: 'Sources disagree', z: 'Checked: not there', o: "Not this product's job",
}
const CONF_WORD: Record<string, string> = { v: 'checked against a source', r: 'reported, not yet checked', u: 'not checked' }

/**
 * The row panel in this display: the part's status worked out with its own numbers, the standards
 * that cover it (each with a notch per shipping product), who uses each, and every shipping
 * product's claim as a disclosure. The sheet's shell, width, scrim and Close are the Atlas's own.
 */
export function TogetherPanel({ model, state, onClose }: { model: Model; state: AppState; onClose: () => void }) {
  const S = ROW_SHEET
  const cid = state.detail!.cid
  const [std, setStd] = useState<string | null>(null)
  const [prod, setProd] = useState<string | null>(null)
  const [all, setAll] = useState<boolean | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  // The control that opened the panel, read before focus moves, so closing returns to it.
  const opener = useRef(document.activeElement as HTMLElement | null)

  useEffect(() => {
    closeRef.current?.focus()
    const back = opener.current
    return () => { if (back && back !== document.body && document.contains(back)) back.focus() }
  }, [])

  if (!model.detLoaded) return null
  const t = togetherOf(model)
  const p = t.byId.get(cid)
  if (!p) return null
  const np = t.products.length
  const wide = WIDE_DEFAULT
  const k = statusOf(p, wide)
  const words = statusWords(np, wide)
  const lanes = p.cap.uses.filter((u) => t.lanes.includes(u)).map(laneLabel)
  const sn = (id: string) => shortName(model, id)
  const allOpen = all ?? !p.std.length

  const evidence = (sid: string) => {
    const code = model.cov[sid]?.[cid]
    const det = model.det[sid]?.[cid]
    const l = levelOf(code)
    const c = confOf(code)
    return (
      <div className="ev">
        {l && <p><b>{LEVEL_WORD[l] ?? l}</b>{c ? ` — ${CONF_WORD[c]}` : ''}.</p>}
        {det?.[0] ? <p>{det[0]}</p> : <p className="wt-quiet">No note was recorded for this claim.</p>}
        <span className="tiny">Sources</span>
        {det?.[1]?.length
          ? det[1].slice(0, 4).map((src, i) => (
              <div key={i} className="src">
                {src[0] ? <a href={src[0]} target="_blank" rel="noreferrer">{src[1]}</a> : <span>{src[1]}</span>}
                <span className="k">{src[2]}</span>
                {src[3] && <q>{src[3]}</q>}
              </div>
            ))
          : <p className="wt-quiet">No source is attached.</p>}
      </div>
    )
  }
  const item = (key: string, label: ReactNode, tag: string, sid: string, plain = false) => {
    const isOpen = prod === key
    return (
      <div key={key}>
        <button type="button" className="prod" data-prod={key} aria-expanded={isOpen} onClick={() => setProd(isOpen ? null : key)}>
          <span className="tw" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
          <span className="nm" style={plain ? { fontWeight: 400 } : undefined}>{label}</span>
          {tag && <span className="cf">{tag}</span>}
        </button>
        {isOpen && evidence(sid)}
      </div>
    )
  }
  const levelTag = (sid: string) => (LEVEL_WORD[levelOf(model.cov[sid]?.[cid]) ?? ''] ?? '').toLowerCase()
  const products = (ids: string[], scope: string, tag: (id: string) => string = levelTag) =>
    ids.map((id) => item(`${scope}:${id}`, fullName(model, id), tag(id), id))
  const names = (ids: string[]) => <p className="names">{ids.map(sn).join(', ')}</p>

  // Tab stays inside the open panel.
  const trap = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab') return
    const f = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])
    if (!f.length) return
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus() }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus() }
  }

  const byLevel = (code: string) => t.products.filter((id) => levelOf(model.cov[id]?.[cid]) === code)
  const unassessed = t.products.filter((id) => !model.cov[id]?.[cid])
  const notYet = t.notShipping.filter((id) => ['n', 'x', 'p'].includes(levelOf(model.cov[id]?.[cid]) ?? ''))

  return (
    <div style={S.scrim} onClick={onClose} role="presentation">
      <aside ref={panelRef} style={S.panel} className="claim-detail wt-root wt-panel" role="dialog" aria-modal="true"
        aria-labelledby="wt-panel-title" onClick={(e) => e.stopPropagation()} onKeyDown={trap}>
        <header style={S.head}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={S.eyebrow}>{[...lanes, 'must agree'].join(' · ')}</span>
            <h2 id="wt-panel-title" style={S.title}>{p.cap.name}</h2>
          </div>
          <button ref={closeRef} type="button" style={S.close} onClick={onClose} title="Close (Escape)">Close</button>
        </header>

        <div style={{ overflowY: 'auto', minHeight: 0, paddingBottom: 18 }}>
          <p style={S.definition}>{p.cap.def}</p>
          {p.cap.why && <p style={S.binding}>Why two systems must agree: {p.cap.why}</p>}
          <div className="verdict" data-status={k}>
            <Swatch k={k} />
            <div><b>{words[k].word}</b><p>{verdict(model, t, p, wide)}</p></div>
          </div>

          <h3 className="sh">Standards that cover it · {p.std.length}</h3>
          <p className="shnote">{p.std.length
            ? `Each notch is one of the ${np} shipping products, in the same order on every line; a filled notch uses this standard for this part. Pick a standard to see which products.`
            : 'No standard or specification in the Atlas covers this part.'}</p>
          {p.std.map((x) => {
            const isOpen = std === x.id
            const others = p.doers.filter((id) => !x.named.includes(id))
            return (
              <div key={x.id}>
                <button type="button" className="stdb" data-std={x.id} aria-expanded={isOpen}
                  onClick={() => { setStd(isOpen ? null : x.id); setProd(null) }}>
                  <span className="tw" aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
                  <span className="nm">{sn(x.id)}</span>
                  <span className="wt-notches" aria-hidden="true">{t.products.map((id) => <i key={id} className={x.named.includes(id) ? 'on' : ''} />)}</span>
                  <span className="fg">{x.named.length} of {np} use it</span>
                </button>
                {isOpen && (
                  <div className="lvl">
                    <p className="names">{fullName(model, x.id)} · {kindWord(model, x.id)}, {model.bySubject.get(x.id)?.status}.</p>
                    <div className="band">Use {sn(x.id)} for this part<span className="n">{x.named.length}</span></div>
                    {x.named.length
                      ? products(x.named, x.id)
                      : <p className="wt-quiet">No shipping product's sources name {sn(x.id)} as what it uses for this part.</p>}
                    {others.length > 0 && (
                      <>
                        <div className="band">Do the part without naming {sn(x.id)}<span className="n">{others.length}</span></div>
                        {products(others, `${x.id}-o`, (id) => {
                          const named = p.std.filter((y) => y.named.includes(id)).map((y) => sn(y.id))
                          return named.length ? `names ${named.join(', ')}` : 'names no standard'
                        })}
                      </>
                    )}
                    {item(`${x.id}-s:${x.id}`, `Why the Atlas says ${sn(x.id)} covers this part`, '', x.id, true)}
                  </div>
                )}
              </div>
            )
          })}
          {p.part.length > 0 && <p className="names">Covers it only partly, not counted: {p.part.map(sn).join(', ')}.</p>}

          <h3 className="sh">
            <button type="button" className="shbtn" aria-expanded={allOpen} onClick={() => setAll(!allOpen)}>
              <span aria-hidden="true">{allOpen ? '▾' : '▸'}</span> Every shipping product on this part · {p.doers.length} of {np} do it
            </button>
          </h3>
          {!allOpen ? (
            <p className="shnote">Built in or through an extension, whatever standard they name or none. Open the list for each product's evidence.</p>
          ) : (
            <>
              <p className="shnote">Pick a product for its evidence.</p>
              {([['n', 'Built in'], ['x', 'Through an extension'], ['p', 'Partly'], ['c', 'Sources disagree']] as const).map(([code, word]) => {
                const ids = byLevel(code)
                return ids.length ? (
                  <div key={code}><div className="band">{word}<span className="n">{ids.length}</span></div>{products(ids, 'all')}</div>
                ) : null
              })}
              {byLevel('z').length > 0 && <><div className="band">Checked: not there<span className="n">{byLevel('z').length}</span></div>{names(byLevel('z'))}</>}
              {byLevel('o').length > 0 && <><div className="band">Not this product's job<span className="n">{byLevel('o').length}</span></div>{names(byLevel('o'))}</>}
              {unassessed.length > 0 && <><div className="band">No claim recorded<span className="n">{unassessed.length}</span></div>{names(unassessed)}</>}
              {notYet.length > 0 && <><div className="band">Not shipping yet, not counted<span className="n">{notYet.length}</span></div>{products(notYet, 'other')}</>}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
