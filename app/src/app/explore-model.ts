// The data behind the two candidate displays, Map and Line-up.
//
// Everything here is computed from the research snapshot the rest of the app
// reads: subjects, their display families, capability groups, the coverage
// claims, conflicts and the use-case lanes. Nothing is added to the data. No
// React, so the rules can be tested on their own.
//
// Both displays are candidates. They are reached only through the address flag
// `?candidates`, so the live default is unchanged until one is chosen.

import type { Capability, LaneId, Level, Model, Subject } from '../design-model.ts'
import { levelOf } from '../design-model.ts'

// ---------------------------------------------------------------------------
// The address flag
// ---------------------------------------------------------------------------

export type CandidateId = 'map' | 'lineup'
export const CANDIDATES: Array<{ id: CandidateId; label: string; question: string }> = [
  { id: 'map', label: 'Map', question: 'Which subjects reach which parts of the map?' },
  { id: 'lineup', label: 'Line-up', question: 'How far does each subject reach, family by family?' },
]

/**
 * Reads the flag from the query string, which the analysis address (the hash)
 * never touches. `?candidates` shows the candidate displays in the switcher;
 * `?candidates=map` or `?candidates=lineup` also opens that display.
 */
export function readCandidateFlag(search: string): { enabled: boolean; open: CandidateId | null } {
  const p = new URLSearchParams(search.replace(/^\?/, ''))
  if (!p.has('candidates')) return { enabled: false, open: null }
  const v = p.get('candidates')
  return { enabled: true, open: CANDIDATES.some((c) => c.id === v) ? (v as CandidateId) : null }
}

/** The query string with the flag set to the open candidate, keeping everything else. */
export function writeCandidateFlag(search: string, open: CandidateId | null): string {
  const p = new URLSearchParams(search.replace(/^\?/, ''))
  p.set('candidates', open ?? '')
  return `?${p.toString().replace(/candidates=(&|$)/, 'candidates$1')}`
}

// ---------------------------------------------------------------------------
// Families: the display groups the sidebar already uses. Colour follows them.
// ---------------------------------------------------------------------------

export const FAMILY_ORDER = [
  'msf', 'standard', 'project', 'device-platform', 'game-engine', 'web-runtime', 'platform', 'world-model', 'tool',
] as const

/** Display family of every subject. A subject in no family is 'other'. */
export function familyOf(model: Model): Map<string, string> {
  const out = new Map<string, string>()
  for (const g of model.displayGroups) for (const id of g.subjects) if (!out.has(id)) out.set(id, g.id)
  for (const s of model.subjects) if (!out.has(s.id)) out.set(s.id, 'other')
  return out
}

/** Families in display order, each with its member subjects in sidebar order. */
export function families(model: Model): Array<{ id: string; name: string; subjects: Subject[] }> {
  const rank = (id: string) => {
    const i = (FAMILY_ORDER as readonly string[]).indexOf(id)
    return i === -1 ? FAMILY_ORDER.length : i
  }
  return [...model.displayGroups]
    .sort((a, b) => rank(a.id) - rank(b.id))
    .map((g) => ({
      id: g.id,
      name: g.name,
      subjects: g.subjects.map((id) => model.bySubject.get(id)).filter((s): s is Subject => Boolean(s)),
    }))
}

/** Same set as the basis rule in design-model.ts: these count as production. */
const PRODUCTION = new Set(['shipping', 'ratified', 'board-approved', 'mixed'])
export const isProduction = (s: Subject): boolean => PRODUCTION.has(s.status)

// ---------------------------------------------------------------------------
// Per-subject counts over the rows on screen
// ---------------------------------------------------------------------------

export interface SubjectCounts {
  n: number
  x: number
  p: number
  z: number
  c: number
  o: number
  /** Rows on screen nobody has assessed for this subject. */
  never: number
  rows: number
}

export function subjectCounts(model: Model, sid: string, rows: Capability[]): SubjectCounts {
  const out: SubjectCounts = { n: 0, x: 0, p: 0, z: 0, c: 0, o: 0, never: 0, rows: rows.length }
  for (const c of rows) {
    const level = levelOf(model.cov[sid]?.[c.id])
    if (level) out[level]++
    else out.never++
  }
  return out
}

export type Measure = 'n' | 'nx' | 'nxp'
export const MEASURES: Array<{ id: Measure; label: string; levels: Level[]; word: string }> = [
  { id: 'n', label: 'Built in', levels: ['n'], word: 'built in' },
  { id: 'nx', label: 'Built in or extension', levels: ['n', 'x'], word: 'built in or through an extension' },
  { id: 'nxp', label: 'Any support', levels: ['n', 'x', 'p'], word: 'built in, through an extension or partial' },
]
export const measureValue = (k: SubjectCounts, m: Measure): number =>
  m === 'n' ? k.n : m === 'nx' ? k.n + k.x : k.n + k.x + k.p

// ---------------------------------------------------------------------------
// Map: links between subjects and capability groups
// ---------------------------------------------------------------------------

export interface GroupLink {
  sid: string
  gid: string
  /** Rows on screen in this group the subject has built in or through an extension. */
  reach: number
  partial: number
  conflicts: number
  /** Rows on screen in this group. */
  rows: number
}

/**
 * One link per subject and group where the subject has any support or a
 * recorded conflict among the rows on screen.
 */
export function groupLinks(model: Model, subjects: string[], rows: Capability[]): GroupLink[] {
  const byGroup = new Map<string, Capability[]>()
  for (const c of rows) byGroup.set(c.g, [...(byGroup.get(c.g) ?? []), c])
  const out: GroupLink[] = []
  for (const sid of subjects) {
    for (const [gid, caps] of byGroup) {
      let reach = 0
      let partial = 0
      let conflicts = 0
      for (const c of caps) {
        const level = levelOf(model.cov[sid]?.[c.id])
        if (level === 'n' || level === 'x') reach++
        else if (level === 'p') partial++
        else if (level === 'c') conflicts++
      }
      if (reach || partial || conflicts) out.push({ sid, gid, reach, partial, conflicts, rows: caps.length })
    }
  }
  return out
}

/**
 * The links drawn before anything is selected: the subject has at least half
 * of the group's rows on screen, and at least two of them, built in or through
 * an extension. One plain rule, so a reader can check any line by counting.
 * The floor of two keeps a lane stop readable, where a group may have only one
 * or two rows in the lane and half of it is a single row.
 */
export const isStrong = (l: GroupLink): boolean => l.reach >= 2 && l.reach * 2 >= l.rows

/** Subjects sharing the most rows on screen with `sid`, both built in or through an extension. */
export function peers(model: Model, sid: string, others: string[], rows: Capability[], k = 5): Array<{ id: string; shared: number }> {
  const has = (id: string, cid: string) => {
    const l = levelOf(model.cov[id]?.[cid])
    return l === 'n' || l === 'x'
  }
  const mine = rows.filter((c) => has(sid, c.id))
  return others
    .filter((id) => id !== sid)
    .map((id, i) => ({ id, i, shared: mine.filter((c) => has(id, c.id)).length }))
    .filter((p) => p.shared > 0)
    .sort((a, b) => b.shared - a.shared || a.i - b.i)
    .slice(0, k)
    .map(({ id, shared }) => ({ id, shared }))
}

// ---------------------------------------------------------------------------
// Map: the stops (overview and every use-case lane)
// ---------------------------------------------------------------------------

export interface StopSummary {
  rows: number
  /** Rows at least one selected subject has built in. */
  builtIn: number
  /** Rows no selected subject has built in or through an extension, but somebody assessed. */
  nobody: number
  /** Rows nobody selected has assessed at all. */
  unassessed: number
  /** Rows with at least one recorded conflict among the selected subjects. */
  conflictRows: number
  /** Groups holding the rows on screen, most rows first. */
  groups: Array<{ id: string; name: string; rows: number }>
  /** Selected subjects reaching the most rows on screen, built in or through an extension. */
  leaders: Array<{ id: string; reach: number }>
}

export function stopSummary(model: Model, on: string[], rows: Capability[]): StopSummary {
  let builtIn = 0
  let nobody = 0
  let unassessed = 0
  let conflictRows = 0
  for (const c of rows) {
    const levels = on.map((id) => levelOf(model.cov[id]?.[c.id]))
    if (levels.includes('n')) builtIn++
    const scored = levels.filter((l) => l && l !== 'o')
    if (!levels.includes('n') && !levels.includes('x') && scored.length > 0) nobody++
    if (levels.every((l) => !l)) unassessed++
    if (levels.includes('c')) conflictRows++
  }
  const groups = model.groups
    .map((g) => ({ id: g.id, name: g.name, rows: rows.filter((c) => c.g === g.id).length }))
    .filter((g) => g.rows > 0)
    .sort((a, b) => b.rows - a.rows)
  const leaders = on
    .map((id, i) => {
      const k = subjectCounts(model, id, rows)
      return { id, i, reach: k.n + k.x }
    })
    .filter((x) => x.reach > 0)
    .sort((a, b) => b.reach - a.reach || a.i - b.i)
    .slice(0, 5)
    .map(({ id, reach }) => ({ id, reach }))
  return { rows: rows.length, builtIn, nobody, unassessed, conflictRows, groups, leaders }
}

export const STOPS: Array<LaneId | null> = [null, 'U1', 'U2', 'U3', 'U4', 'U6', 'U7', 'U10']

// ---------------------------------------------------------------------------
// Map: a fixed layout. Specifications on the left, capability groups in the
// middle, implementations on the right. Deterministic, so a node never moves
// between visits and a screenshot can be compared with the next one.
// ---------------------------------------------------------------------------

export const NODE = { w: 158, h: 30, gap: 8, colGap: 12, headH: 24 } as const
export const GROUP_NODE = { w: 190, h: 44, gap: 12 } as const
const SIDE_GAP = 130
const LEFT_FAMILIES = ['msf', 'standard', 'project']

export interface MapNode {
  id: string
  kind: 'subject' | 'group'
  family: string
  x: number
  y: number
  w: number
  h: number
  /** Which side of the canvas, so links leave from the side facing the groups. */
  side: 'left' | 'right' | 'centre'
}

export interface MapLayout {
  nodes: MapNode[]
  byId: Map<string, MapNode>
  heads: Array<{ family: string; name: string; x: number; y: number; w: number }>
  width: number
  height: number
}

export function layoutMap(model: Model): MapLayout {
  const fams = families(model)
  const left = fams.filter((f) => LEFT_FAMILIES.includes(f.id))
  const right = fams.filter((f) => !LEFT_FAMILIES.includes(f.id))
  const blockW = NODE.w * 2 + NODE.colGap
  const centreX = blockW + SIDE_GAP
  const rightX = centreX + GROUP_NODE.w + SIDE_GAP

  const nodes: MapNode[] = []
  const heads: MapLayout['heads'] = []
  const placeSide = (list: typeof fams, x0: number, side: 'left' | 'right'): number => {
    let y = 0
    for (const f of list) {
      heads.push({ family: f.id, name: f.name, x: x0, y, w: blockW })
      y += NODE.headH
      f.subjects.forEach((s, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        nodes.push({
          id: s.id, kind: 'subject', family: f.id, side,
          // The column nearer the groups fills first, so a family of one sits
          // next to the links it sends.
          x: x0 + (side === 'left' ? 1 - col : col) * (NODE.w + NODE.colGap),
          y: y + row * (NODE.h + NODE.gap),
          w: NODE.w, h: NODE.h,
        })
      })
      y += Math.ceil(f.subjects.length / 2) * (NODE.h + NODE.gap) + 10
    }
    return y
  }
  const leftH = placeSide(left, 0, 'left')
  const rightH = placeSide(right, rightX, 'right')

  const groupsH = model.groups.length * (GROUP_NODE.h + GROUP_NODE.gap) - GROUP_NODE.gap
  const height = Math.max(leftH, rightH, groupsH + NODE.headH)
  const gy0 = Math.max(NODE.headH, (height - groupsH) / 2)
  heads.push({ family: 'groups', name: 'Capability groups', x: centreX, y: gy0 - NODE.headH, w: GROUP_NODE.w })
  model.groups.forEach((g, i) => {
    nodes.push({
      id: g.id, kind: 'group', family: 'groups', side: 'centre',
      x: centreX, y: gy0 + i * (GROUP_NODE.h + GROUP_NODE.gap), w: GROUP_NODE.w, h: GROUP_NODE.h,
    })
  })

  return { nodes, byId: new Map(nodes.map((n) => [n.kind === 'group' ? `g:${n.id}` : n.id, n])), heads, width: rightX + blockW, height }
}

/** A link's path: from the side of the subject facing the groups to the group's near side. */
export function linkPath(a: MapNode, g: MapNode): string {
  const fromLeft = a.side === 'left'
  const x1 = fromLeft ? a.x + a.w : a.x
  const y1 = a.y + a.h / 2
  const x2 = fromLeft ? g.x : g.x + g.w
  const y2 = g.y + g.h / 2
  const dx = (x2 - x1) * 0.5
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
}

/**
 * A peer arc between two subjects. On one side it bows outward, away from the
 * groups. Across sides it rises over the top of the groups' column.
 */
export function peerPath(a: MapNode, b: MapNode): string {
  const side = a.side === 'right' || b.side === 'right' ? 'right' : 'left'
  if (a.side !== b.side) {
    const x1 = a.side === 'left' ? a.x + a.w : a.x
    const x2 = b.side === 'left' ? b.x + b.w : b.x
    const y1 = a.y + a.h / 2
    const y2 = b.y + b.h / 2
    // A cubic's midpoint is a quarter ends, three quarters controls: put the
    // controls high enough that the midpoint clears the top of the canvas.
    const c = -((y1 + y2) / 8 + 24) / 0.75
    return `M ${x1} ${y1} C ${x1 + (x2 - x1) * 0.25} ${c}, ${x2 - (x2 - x1) * 0.25} ${c}, ${x2} ${y2}`
  }
  const edge = (n: MapNode) => (side === 'left' ? n.x : n.x + n.w)
  const x1 = edge(a)
  const x2 = edge(b)
  const y1 = a.y + a.h / 2
  const y2 = b.y + b.h / 2
  const bow = (side === 'left' ? -1 : 1) * (40 + Math.min(120, Math.abs(y2 - y1) / 4))
  return `M ${x1} ${y1} C ${x1 + bow} ${y1}, ${x2 + bow} ${y2}, ${x2} ${y2}`
}

/** Shortens a name to fit a node, at a word boundary where one is near. */
export function shortName(name: string, max = 25): string {
  if (name.length <= max) return name
  const cut = name.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,(–-]+$/, '')}…`
}

// ---------------------------------------------------------------------------
// Line-up: dots on one axis per family, labels packed so none overlap
// ---------------------------------------------------------------------------

export interface PackedDot<T> {
  item: T
  x: number
  /** Which sub-row of the family's band the dot and its label sit in. */
  lane: number
}

/**
 * Greedy interval packing: each dot, with its label, takes the first sub-row
 * where it clears what is already there by `pad`. `span` gives the horizontal
 * extent of the dot and its label. Sorted by where that extent starts, so the
 * result is stable for the same input.
 */
export function packDots<T>(items: T[], xOf: (t: T) => number, span: (t: T, x: number) => [number, number], pad = 10): PackedDot<T>[] {
  const ends: number[] = []
  return [...items]
    .map((item, i) => {
      const x = xOf(item)
      const [start, end] = span(item, x)
      return { item, i, x, start, end }
    })
    .sort((a, b) => a.start - b.start || a.i - b.i)
    .map(({ item, x, start, end }) => {
      let lane = ends.findIndex((e) => e + pad <= start)
      if (lane === -1) {
        lane = ends.length
        ends.push(0)
      }
      ends[lane] = end
      return { item, x, lane }
    })
}
