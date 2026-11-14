// "Why these rows": the reason a task preset picked each row, one sentence per row, with how
// many related use cases back it. Opening a row shows the use cases and, apart from them, which
// subjects support it.

import type { Dispatch } from 'react'
import type { Model } from '../design-model.ts'
import { laneLabel } from '../design-model.ts'
import type { Action, Preset } from './state.ts'
import { linkCount } from './use-cases.ts'

export function PresetReasons({ model, preset, dispatch }: {
  model: Model
  preset: Preset
  dispatch: Dispatch<Action>
}) {
  const reasons = preset.reasons ?? {}
  const rows = (preset.sel ?? Object.keys(reasons)).filter((id) => reasons[id] && model.byCapability.has(id))
  if (!rows.length) return null
  return (
    <section style={r.card} aria-labelledby="why-rows">
      <h2 id="why-rows" style={r.eyebrow}>Why these rows</h2>
      <p style={r.intro}>
        Each row is here for a reason in the task. Open a row to see the use cases behind it and,
        separately, which subjects support it.
      </p>
      <ul style={r.list}>
        {rows.map((id) => {
          const c = model.byCapability.get(id)!
          const n = linkCount(model, id)
          return (
            <li key={id} style={r.item}>
              <div style={r.side}>
                <button type="button" style={r.rowLink} onClick={() => dispatch({ type: 'detail', detail: { cid: id, sid: null } })}>
                  {c.name}
                </button>
                <span style={r.tags}>
                  {c.interop !== 'none' && <span style={c.interop === 'must' ? r.tagMust : r.tag}>{c.interop} interoperate</span>}
                  {c.uses.includes('U7') && <span style={r.tagLane}>{laneLabel('U7')} lane</span>}
                </span>
                <span style={r.count}>
                  {n === null ? 'related use cases loading'
                    : n === 0 ? 'no related use case linked'
                    : `${n} related use case${n === 1 ? '' : 's'}`}
                </span>
              </div>
              <p style={r.reason}>{reasons[id]}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const tag = { fontFamily: 'var(--fm)', fontSize: 10, border: '1px solid var(--ruleS)', borderRadius: 2, padding: '0 4px', color: 'var(--soft)' } as const

const r = {
  card: { border: '1px solid var(--rule)', borderRadius: 'var(--r)', background: 'var(--panel)', padding: '10px 12px', marginBottom: 12 } as const,
  eyebrow: { margin: 0, fontFamily: 'var(--fl)', fontWeight: 700, fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--faint)' } as const,
  intro: { margin: '4px 0 6px', fontSize: 13, color: 'var(--soft)' } as const,
  list: { listStyle: 'none', margin: 0, padding: 0 } as const,
  item: { display: 'flex', flexWrap: 'wrap', gap: '4px 16px', borderTop: '1px solid var(--rule)', padding: '8px 0' } as const,
  side: { flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 } as const,
  rowLink: { background: 'transparent', border: 0, padding: 0, cursor: 'pointer', color: 'var(--ac)', textDecoration: 'underline', fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 13, textAlign: 'left' } as const,
  tags: { display: 'flex', flexWrap: 'wrap', gap: 4 } as const,
  tag,
  tagMust: { ...tag, borderColor: 'var(--warn)', color: 'var(--warn)' } as const,
  tagLane: { ...tag, borderColor: 'var(--lane)', color: 'var(--lane)' } as const,
  count: { fontFamily: 'var(--fm)', fontSize: 10.5, color: 'var(--faint)' } as const,
  reason: { flex: '2 1 280px', minWidth: 0, margin: 0, fontSize: 13.5 } as const,
}
