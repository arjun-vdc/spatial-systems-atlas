// The MSF Map data and counting model, ported from the accepted design candidate
// `design-candidate/MSF Map - redesign v3.dc.html` and its handoff notes.
//
// This module supersedes the earlier `data.ts` and `select.ts` pair, which belong
// to the interface that was replaced. Both still drive the old shell and are left
// in place until the view port lands; nothing new should be built on them.
//
// Two rules from the design notes govern every line below.
//
// 1. Seven meanings stay distinct: built in, through an extension, partial,
//    absent, conflict, out of scope, and never assessed. A missing claim is NOT
//    "absent". Absent means somebody checked and it is not there. A missing key
//    means nobody has checked. Collapsing the two is the worst thing that can be
//    done to this dataset.
// 2. One definition per counted word. The old tool used "reach" three ways and
//    its numbers stopped being trustworthy.
//
// No React. Called once at load and memoised.

export type Level = 'n' | 'x' | 'p' | 'z' | 'c' | 'o'
export type Conf = 'v' | 'r' | 'u'
/** Support level then confidence, e.g. "nv" = built in, verified. */
export type Code = string

/** A use-case lane: "U" and a number. The data names which lanes exist (counts.lanes). */
export type LaneId = `U${number}`
export type RowFilter = 'all' | 'overlap' | 'thin' | 'gap' | 'conflict' | 'connect' | 'interop'
export type Basis = 'prod' | 'all' | 'must'

/** Statuses that count as production when the basis is `prod`. */
const PRODUCTION = new Set(['shipping', 'ratified', 'board-approved', 'mixed'])

const LEVEL_OF: Record<string, Level> = {
  native: 'n',
  'via-extension': 'x',
  partial: 'p',
  none: 'z',
  conflicts: 'c',
  'out-of-scope': 'o',
}
const CONF_OF: Record<string, Conf> = { verified: 'v', reported: 'r', unverified: 'u' }

export interface RawSource {
  0: string | null
  1: string
  2: string
  3: string
}

export interface Capability {
  id: string
  g: string
  name: string
  def: string
  /** `connect` = agreed when two systems connect; otherwise fixed when content is made. */
  bind: 'build' | 'connect'
  interop: 'must' | 'should' | 'none'
  why: string
  sort: number
  uses: LaneId[]
}

export interface Subject {
  id: string
  name: string
  kind: string
  org: string | null
  licence: string | null
  url: string | null
  status: string
  version: string | null
  /** First sentence of the summary, for the hero. */
  sum: string
  /** Rows this subject has at built in, through an extension, or partial. One definition only. */
  reach: number
  /** Rows at built in. */
  native: number
  /** Capability count minus the subject's recorded claim count. */
  never: number
  /** Recorded conflict claims for this subject. A number in the export, not a list. */
  conflicts: number
  unverified: number
  scored: number
  /** Register ids of the OpenSpatials platforms this subject is. Absent when it is none. */
  platform?: string[]
}

export interface GroupHealth {
  caps: number
  proto: number
  contested: number
  thin: number
  gap: number
  conflict: number
}

export interface Model {
  groups: Array<{ id: string; name: string; plane: string; sort: number }>
  capabilities: Capability[]
  subjects: Subject[]
  displayGroups: Array<{ id: string; name: string; subjects: string[] }>
  counts: Record<string, unknown>
  /** cov[subjectId][capabilityId] = 2-char code. A missing key means never assessed. */
  cov: Record<string, Record<string, Code>>
  /** det[subjectId][capabilityId] = [note, sources]. Kept out of the grid. */
  det: Record<string, Record<string, [string, RawSource[]]>>
  /** True when det is populated. False when the model was built from the index. */
  detLoaded: boolean
  /** Level counts per capability, across all subjects in the export. */
  agg: Record<string, Record<string, number>>
  health: Record<string, GroupHealth>
  /** Every lane the data carries, in order (U1, U2, ... U10), with its label and must-row count. */
  lanes: Record<LaneId, { label: string; n: number }>
  byCapability: Map<string, Capability>
  bySubject: Map<string, Subject>
}

export const LANE_LABEL: Record<LaneId, string> = {
  U1: 'Content portability',
  U2: 'Avatar portability',
  U3: 'World-to-world travel',
  U4: 'Agent participation',
  U6: 'Same place, same thing',
  U7: 'Training results that travel',
  U10: 'Shared presence',
}

/** A lane's label; a lane the data carries before it has a label here still gets a name. */
export const laneLabel = (lane: LaneId): string => LANE_LABEL[lane] ?? `Use case ${lane}`

/** Is this text a lane id? */
export const isLaneId = (x: unknown): x is LaneId => typeof x === 'string' && /^U[0-9]+$/.test(x)

/** The lanes the model carries, in number order. */
export const laneIds = (model: Pick<Model, 'lanes'>): LaneId[] => Object.keys(model.lanes) as LaneId[]

/** Compact tuples in, named fields out. Nothing is rewritten or recomputed later. */
export function adapt(raw: any): Model {
  const capabilities: Capability[] = raw.capabilities.map((c: any) => ({
    id: c.id,
    g: c.group_id,
    name: c.name,
    def: c.definition,
    bind: c.binding,
    interop: c.interop,
    why: c.interop_reason,
    sort: c.sort,
    uses: (c.uses ?? []) as LaneId[],
  }))

  const cov: Model['cov'] = {}
  const det: Model['det'] = {}
  const agg: Model['agg'] = {}
  let hasDetail = false
  for (const c of capabilities) {
    agg[c.id] = { native: 0, 'via-extension': 0, partial: 0, none: 0, conflicts: 0, 'out-of-scope': 0 }
  }
  for (const sid of Object.keys(raw.coverage)) {
    const row: Record<string, Code> = {}
    const detail: Record<string, [string, RawSource[]]> = {}
    for (const cid of Object.keys(raw.coverage[sid])) {
      const claim = raw.coverage[sid][cid]
      row[cid] = (LEVEL_OF[claim[0]] ?? 'z') + (CONF_OF[claim[1]] ?? 'r')
      if (claim.length > 2) {
        detail[cid] = [claim[2], (claim[3] ?? []) as RawSource[]]
        hasDetail = true
      }
      if (agg[cid]) agg[cid][claim[0]] = (agg[cid][claim[0]] ?? 0) + 1
    }
    cov[sid] = row
    if (Object.keys(detail).length) det[sid] = detail
  }

  const subjects: Subject[] = raw.subjects.map((s: any) => {
    const row = cov[s.id] ?? {}
    const levels = Object.keys(row).map((k) => row[k][0])
    return {
      id: s.id,
      name: s.name,
      kind: s.kind,
      org: s.org ?? null,
      licence: s.licence ?? null,
      url: s.url ?? null,
      status: s.status,
      version: s.version ?? null,
      sum: String(s.summary ?? '').split(/(?<=\.)\s/)[0],
      reach: levels.filter((l) => l === 'n' || l === 'x' || l === 'p').length,
      native: levels.filter((l) => l === 'n').length,
      never: capabilities.length - levels.length,
      conflicts: Number(s.conflicts ?? 0),
      unverified: Number(s.unverified ?? 0),
      scored: Number(s.scored ?? 0),
      ...(Array.isArray(s.platform) && s.platform.length ? { platform: s.platform.map(String) } : {}),
    }
  })

  const health: Record<string, GroupHealth> = {}
  for (const g of raw.groups) {
    const caps = capabilities.filter((c) => c.g === g.id)
    let contested = 0
    let thin = 0
    let gap = 0
    let conflict = 0
    for (const c of caps) {
      const a = agg[c.id]
      const ne = a.native + a['via-extension']
      const scored = a.native + a['via-extension'] + a.partial + a.none + a.conflicts
      if (ne >= 2) contested++
      if (a.native === 1) thin++
      if (ne === 0 && scored > 0) gap++
      if (a.conflicts > 0) conflict++
    }
    health[g.id] = {
      caps: caps.length,
      proto: caps.filter((c) => c.bind === 'connect').length,
      contested,
      thin,
      gap,
      conflict,
    }
  }

  // Every lane the data counts, plus any lane a row names, in number order. The
  // four original lanes are always present so an older export still reads.
  const laneCounts: Record<string, number> = raw.counts?.lanes ?? {}
  const named = new Set<LaneId>(['U1', 'U2', 'U3', 'U4'])
  for (const k of Object.keys(laneCounts)) if (isLaneId(k)) named.add(k)
  for (const c of capabilities) for (const u of c.uses) if (isLaneId(u)) named.add(u)
  const lanes = {} as Model['lanes']
  for (const id of [...named].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))) {
    lanes[id] = { label: laneLabel(id), n: laneCounts[id] }
  }

  return {
    groups: raw.groups,
    capabilities,
    subjects,
    displayGroups: raw.display_groups,
    counts: raw.counts ?? {},
    cov,
    det,
    detLoaded: hasDetail,
    agg,
    health,
    lanes,
    byCapability: new Map(capabilities.map((c) => [c.id, c])),
    bySubject: new Map(subjects.map((s) => [s.id, s])),
  }
}

/** Fill in the notes and sources from the full payload. */
export function mergeDetail(base: Model, raw: any): Model {
  const det: Model['det'] = {}
  for (const sid of Object.keys(raw.coverage)) {
    const detail: Record<string, [string, RawSource[]]> = {}
    for (const cid of Object.keys(raw.coverage[sid])) {
      const claim = raw.coverage[sid][cid]
      if (claim.length > 2) {
        detail[cid] = [claim[2], (claim[3] ?? []) as RawSource[]]
      }
    }
    if (Object.keys(detail).length) det[sid] = detail
  }
  return { ...base, det, detLoaded: true }
}

/** Everything the counting rules read. The address carries all of it. */
export interface Query {
  /** Subject ids switched on. The comparison IS the selection; there is no second list. */
  on: string[]
  filter: RowFilter
  /** Keep only rows somebody has assessed. */
  hasEntry: boolean
  basis: Basis
  lane: LaneId | null
  /** Capability ids picked by a preset or a link (`sel`). When any are picked, only those rows show. */
  sel?: string[]
}

/** The picked rows, or null when none are picked. */
export const pickedRows = (model: Model, query: Query): Set<string> | null =>
  query.sel?.length ? new Set(query.sel.filter((id) => model.byCapability.has(id))) : null

export const levelOf = (code: Code | undefined): Level | null => (code ? (code[0] as Level) : null)
export const confOf = (code: Code | undefined): Conf | null => (code ? (code[1] as Conf) : null)

/**
 * A lane holds the must rows of one use case (tool/model/CERTIFICATION-LANES.md).
 * Rows that only degrade the use case ("should") are tagged with it but are not in
 * the lane, so the Lane panel's count and the rows a lane shows are the same set.
 */
export const inLane = (c: Capability, lane: LaneId): boolean => c.interop === 'must' && c.uses.includes(lane)

/** Does this capability pass the current row filter? */
export function rowMatch(model: Model, query: Query, c: Capability): boolean {
  const codes = query.on.map((id) => model.cov[id]?.[c.id]).filter(Boolean) as Code[]
  const scored = codes.filter((x) => x[0] !== 'o')
  if (query.hasEntry && scored.length === 0) return false
  if (query.lane && !inLane(c, query.lane)) return false

  const ne = codes.filter((x) => x[0] === 'n' || x[0] === 'x').length
  const nat = codes.filter((x) => x[0] === 'n').length

  switch (query.filter) {
    case 'all':
      return true
    case 'overlap':
      return ne >= 2
    // Counts built-in support only. The old tool's version of this filter
    // silently included extensions and misled every reader of it.
    case 'thin':
      return nat === 1
    // Zero built-in or extension support, but at least one scored claim, so a
    // true research gap is never confused with nobody having looked.
    case 'gap':
      return ne === 0 && scored.length > 0
    case 'conflict':
      return codes.some((x) => x[0] === 'c')
    case 'connect':
      return c.bind === 'connect'
    case 'interop':
      return c.interop === 'must'
  }
}

export function matchingRows(model: Model, query: Query): Capability[] {
  const picked = pickedRows(model, query)
  return model.capabilities.filter((c) => (!picked || picked.has(c.id)) && rowMatch(model, query, c))
}

/**
 * The subject display's own filters, one per figure in its hero. They narrow the
 * rows already shown to those the subject in focus reaches, has built in, has a
 * claim for (or not), or has a recorded conflict on. Every active one must pass.
 */
export interface SubjectOnly {
  reach: boolean
  native: boolean
  assessed: 'all' | 'assessed' | 'unassessed'
  conflicts: boolean
}

export const NO_SUBJECT_ONLY: SubjectOnly = { reach: false, native: false, assessed: 'all', conflicts: false }

export const subjectOnlyActive = (only: SubjectOnly): boolean =>
  only.reach || only.native || only.assessed !== 'all' || only.conflicts

/** Same definitions as the figures: reach is built in, extension or partial; a missing code is not assessed. */
export function subjectRowMatch(model: Model, subjectId: string, only: SubjectOnly, c: Capability): boolean {
  const level = levelOf(model.cov[subjectId]?.[c.id])
  if (only.reach && !(level === 'n' || level === 'x' || level === 'p')) return false
  if (only.native && level !== 'n') return false
  if (only.assessed === 'assessed' && level === null) return false
  if (only.assessed === 'unassessed' && level !== null) return false
  if (only.conflicts && level !== 'c') return false
  return true
}

export const subjectRows = (model: Model, subjectId: string, only: SubjectOnly, rows: Capability[]): Capability[] =>
  rows.filter((c) => subjectRowMatch(model, subjectId, only, c))

export const matchCount = (model: Model, query: Query, filter: RowFilter): number =>
  matchingRows(model, { ...query, filter }).length

export const productionIds = (model: Model, on: string[]): string[] =>
  on.filter((id) => PRODUCTION.has(model.bySubject.get(id)?.status ?? ''))

/** Which selected subjects contribute to a percentage. */
export const countedIds = (model: Model, query: Query): string[] =>
  query.basis === 'all' ? query.on : productionIds(model, query.on)

/** Which capability rows a percentage is measured over. */
export function measuredCaps(model: Model, query: Query): Capability[] {
  if (query.lane) return model.capabilities.filter((c) => inLane(c, query.lane!))
  return query.basis === 'must'
    ? model.capabilities.filter((c) => c.interop === 'must')
    : model.capabilities
}

export interface Coverage {
  /** Percent of measured rows at least one counted subject has built in. */
  native: number
  /** …built in or through an extension. */
  extension: number
  /** …built in, through an extension, or partial. */
  partial: number
  counted: number
  measured: number
}

/**
 * A capability counts as covered when at least one counted subject reaches it.
 * This says somebody has built the thing once. It does not say any two systems
 * work together, and the scope line must keep saying so next to the number.
 */
export function coverage(model: Model, query: Query): Coverage {
  const counted = countedIds(model, query)
  const measured = measuredCaps(model, query)
  const pc = (levels: Level[]): number => {
    if (counted.length === 0 || measured.length === 0) return 0
    let hit = 0
    for (const c of measured) {
      if (counted.some((id) => levels.includes(levelOf(model.cov[id]?.[c.id]) as Level))) hit++
    }
    return Math.round((hit / measured.length) * 100)
  }
  return {
    native: pc(['n']),
    extension: pc(['n', 'x']),
    partial: pc(['n', 'x', 'p']),
    counted: counted.length,
    measured: measured.length,
  }
}

/**
 * A subject whose rows are mostly out of scope.
 *
 * Out of scope means the row does not apply to this kind of subject. It is a real
 * and useful answer, but on screen it looks the same as an absence of work: a
 * subject with few rows reached reads as one nobody has much to say about. When
 * most of the map does not apply, the low reach is a fact about the map's shape,
 * not about the subject, and the display has to say so.
 *
 * The rule: out-of-scope rows outnumber every other row, so more than half of all
 * capabilities sit outside this subject's kind. Below that line the subject is
 * measured mostly on rows that do apply, and the ordinary reading of its figures
 * is the right one. The threshold is a majority rather than a fitted number so a
 * reader can check it: count the rows, compare with half.
 *
 * Never assessed is not out of scope and is not counted here. The two are
 * different facts and the dataset depends on that distinction holding.
 */
export interface ScopeNote {
  /** Rows scored out of scope for this subject. */
  outOfScope: number
  /** Rows that do apply, whatever they were scored. */
  applies: number
  /** Every capability on the map. */
  total: number
}

export function scopeNote(model: Model, subjectId: string): ScopeNote | null {
  const cov = model.cov[subjectId]
  if (!cov) return null
  const total = model.capabilities.length
  if (total === 0) return null
  let outOfScope = 0
  for (const c of model.capabilities) if (levelOf(cov[c.id]) === 'o') outOfScope++
  if (outOfScope * 2 <= total) return null
  return { outOfScope, applies: total - outOfScope, total }
}

/** The shareable address. The address is the state. */
export function shareUrl(
  query: Query,
  view: 'subject' | 'compare' | 'groups' | 'relations',
  focus: string | null,
  relGroup: string | null,
  detail: { cid: string; sid: string | null } | null,
  totalSubjects: number,
): string {
  const p: string[] = []
  p.push(`view=${view}`)
  p.push(`s=${query.on.length === totalSubjects ? 'all' : query.on.join(',')}`)
  if (view === 'subject' && focus) p.push(`of=${focus}`)
  p.push(`rows=${query.filter}${query.hasEntry ? '+assessed' : ''}`)
  p.push(`basis=${query.basis}`)
  if (query.lane) p.push(`lane=${query.lane}`)
  if (view === 'relations' && relGroup) p.push(`group=${relGroup}`)
  if (query.sel?.length) p.push(`sel=${query.sel.join(',')}`)
  if (detail) p.push(`open=${detail.cid}${detail.sid ? `:${detail.sid}` : ''}`)
  return `/msf/atlas/?${p.join('&')}`
}
