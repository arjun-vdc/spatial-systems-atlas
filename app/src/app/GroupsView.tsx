// The Groups display: one card per group, breadth first. Two plain-language lines
// each, so a newcomer can read the shape of the map before learning any of its
// vocabulary. Clicking a card opens that group in the Relationships display.
//
// The sidebar scopes the view, so the bar counts only the rows the row filter
// and lane let through, as every other display does. A group none of them
// reaches stays in place, faded, so the map keeps its shape.

import type { Capability, Model } from '../design-model.ts'
import { cellStyle } from './marks.ts'
import type { Action, AppState } from './state.ts'

export function GroupsView({ model, state, dispatch, rows }: {
  model: Model
  state: AppState
  dispatch: React.Dispatch<Action>
  rows: Capability[]
}) {
  const counted = state.on

  return (
    <div style={s.grid}>
      {model.groups.map((group) => {
        const caps = model.capabilities.filter((c) => c.g === group.id)
        const shown = rows.filter((c) => c.g === group.id)
        const health = model.health[group.id]

        // A row is placed by the strongest support any selected subject has.
        const tally = { n: 0, x: 0, p: 0, none: 0 }
        for (const c of shown) {
          const levels = counted.map((id) => model.cov[id]?.[c.id]?.[0])
          if (levels.includes('n')) tally.n++
          else if (levels.includes('x')) tally.x++
          else if (levels.includes('p')) tally.p++
          else tally.none++
        }

        const segments: Array<[keyof typeof tally, string, string]> = [
          ['n', 'somebody has it built in', 'nv'],
          ['x', 'only through an extension', 'xv'],
          ['p', 'only partial', 'pv'],
          ['none', 'nobody reaches it', 'zv'],
        ]

        return (
          <button key={group.id} type="button" style={{ ...s.card, opacity: shown.length ? 1 : 0.5 }}
            title={`Open ${group.name} in the Relationships display`}
            onClick={() => { dispatch({ type: 'rel-group', id: group.id }); dispatch({ type: 'view', view: 'relations' }) }}>
            <span style={s.name}>{group.name}</span>

            <span style={s.bar}>
              {segments.filter(([k]) => tally[k]).map(([k, word, code]) => (
                <span key={k} title={`${tally[k]} rows ${word}`}
                  style={{ ...cellStyle(code, 12), flex: `${tally[k]} 1 0`, minWidth: 4, height: 12, borderRadius: 1, cursor: 'inherit' }} />
              ))}
            </span>

            <span style={s.line}>
              {shown.length === caps.length ? `${caps.length} rows` : `${shown.length} of ${caps.length} rows shown`}
              {' · '}{health.proto} agreed on connect · {caps.length - health.proto} fixed at build
            </span>
            <span style={s.line}>
              {health.contested} shared by two or more · {health.thin} held by one ·{' '}
              {health.gap} reached by nobody · {health.conflict} with a conflict
            </span>
          </button>
        )
      })}
    </div>
  )
}

const s = {
  grid: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))' } as const,
  card: { display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', border: '1px solid var(--rule)', background: 'var(--panel)', borderRadius: 'var(--r)', padding: '11px 13px', cursor: 'pointer', color: 'var(--ink)' } as const,
  name: { fontFamily: 'var(--fl)', fontWeight: 600, fontSize: 14.5, lineHeight: 1.2 } as const,
  bar: { display: 'flex', gap: 1, height: 12 } as const,
  line: { fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--soft)', lineHeight: 1.45 } as const,
}
