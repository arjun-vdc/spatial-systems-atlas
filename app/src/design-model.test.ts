// Tests for the counting rules. Every figure the map publishes comes from this
// module, so each test below states a rule a reader of the map would recognise,
// not a restatement of the implementation.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  adapt,
  coverage,
  countedIds,
  levelOf,
  confOf,
  matchCount,
  matchingRows,
  measuredCaps,
  productionIds,
  scopeNote,
  shareUrl,
} from './design-model.ts'
import type { Query } from './design-model.ts'

// --- a small hand-built export, small enough to read -----------------------
//
// Four capabilities, four subjects. Claims are the export's own compact tuple:
// [level, confidence, note, sources].
const cap = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  group_id: 'g1',
  name: id,
  definition: '',
  binding: 'build',
  interop: 'none',
  interop_reason: '',
  sort: 0,
  uses: [],
  ...extra,
})

const RAW = {
  groups: [{ id: 'g1', name: 'Group one', plane: 'engine', sort: 1 }],
  capabilities: [
    cap('c.shared'), // two subjects reach it
    cap('c.lonely'), // exactly one has it built in
    cap('c.gap', { interop: 'must' }), // scored, nobody reaches it
    cap('c.wire', { binding: 'connect', uses: ['U2'] }), // a conflict lives here
  ],
  subjects: [
    { id: 'ship', name: 'Shipping one', kind: 'standard', status: 'shipping', summary: 'One. Two.', conflicts: 0, unverified: 0, source_ids: 0, scored: 0 },
    { id: 'draft', name: 'Draft one', kind: 'standard', status: 'draft', summary: 'One. Two.', conflicts: 0, unverified: 0, source_ids: 0, scored: 0 },
    { id: 'ext', name: 'Extension one', kind: 'standard', status: 'ratified', summary: '', conflicts: 0, unverified: 0, source_ids: 0, scored: 0 },
    { id: 'quiet', name: 'Never assessed', kind: 'standard', status: 'shipping', summary: '', conflicts: 0, unverified: 0, source_ids: 0, scored: 0 },
  ],
  coverage: {
    ship: {
      'c.shared': ['native', 'verified', '', []],
      'c.lonely': ['native', 'verified', '', []],
      'c.gap': ['none', 'verified', '', []],
      'c.wire': ['conflicts', 'verified', '', []],
    },
    draft: {
      'c.shared': ['partial', 'reported', '', []],
      'c.gap': ['none', 'unverified', '', []],
      // c.lonely is absent from this row: nobody has checked it.
    },
    ext: {
      'c.shared': ['via-extension', 'verified', '', []],
      'c.lonely': ['via-extension', 'verified', '', []],
      'c.gap': ['out-of-scope', 'verified', '', []],
    },
    quiet: {},
  },
  display_groups: [{ id: 'all', name: 'All', subjects: ['ship', 'draft', 'ext', 'quiet'] }],
  counts: { lanes: { U1: 0, U2: 1, U3: 0, U4: 0 } },
}

const M = adapt(RAW)
const ALL = ['ship', 'draft', 'ext', 'quiet']
const q = (over: Partial<Query> = {}): Query => ({
  on: ALL, filter: 'all', hasEntry: false, basis: 'all', lane: null, ...over,
})

// --- the distinction the whole dataset rests on ---------------------------

test('a capability nobody has checked is not the same as one recorded absent', () => {
  // draft has no claim for c.lonely at all; ship records c.gap as absent.
  assert.equal(M.cov.draft['c.lonely'], undefined, 'unchecked must stay missing')
  assert.equal(levelOf(M.cov.ship['c.gap']), 'z', 'recorded absent is its own level')
  assert.notEqual(levelOf(M.cov.draft['c.lonely']), 'z', 'missing must never become absent')
})

test('all seven support meanings survive the adapter as distinct values', () => {
  const seen = new Set<string | null>()
  for (const sid of ALL) for (const c of M.capabilities) seen.add(levelOf(M.cov[sid]?.[c.id]))
  // built in, extension, partial, absent, conflict, out of scope, and not assessed
  for (const expected of ['n', 'x', 'p', 'z', 'c', 'o', null]) {
    assert.ok(seen.has(expected as never), `level ${expected} was lost or merged`)
  }
})

test('confidence is carried separately from support level', () => {
  assert.equal(levelOf(M.cov.draft['c.gap']), 'z')
  assert.equal(confOf(M.cov.draft['c.gap']), 'u', 'an unverified absence is still an absence')
})

// --- one definition per counted word --------------------------------------

test('reach counts built in, through an extension and partial, and nothing else', () => {
  // ship: c.shared native, c.lonely native, c.gap absent, c.wire conflict -> 2
  assert.equal(M.bySubject.get('ship')!.reach, 2)
  // ext: c.shared extension, c.lonely extension, c.gap out of scope -> 2
  assert.equal(M.bySubject.get('ext')!.reach, 2)
  // draft: c.shared partial counts, c.gap absent does not -> 1
  assert.equal(M.bySubject.get('draft')!.reach, 1)
})

test('built in counts only rows recorded as built in', () => {
  assert.equal(M.bySubject.get('ship')!.native, 2)
  assert.equal(M.bySubject.get('ext')!.native, 0, 'an extension is not built in')
})

test('not assessed is the capability count minus the rows a subject has', () => {
  assert.equal(M.bySubject.get('quiet')!.never, 4, 'a subject with no claims has every row unassessed')
  assert.equal(M.bySubject.get('draft')!.never, 2)
})

// --- the seven row filters -------------------------------------------------

test('two or more have it counts built in and extension together', () => {
  const rows = matchingRows(M, q({ filter: 'overlap' })).map((c) => c.id)
  assert.deepEqual(rows, ['c.shared', 'c.lonely'])
})

test('exactly one has it built in ignores extensions, as its label says', () => {
  const rows = matchingRows(M, q({ filter: 'thin' })).map((c) => c.id)
  // c.lonely: ship built in, ext through an extension. Exactly one is built in.
  assert.deepEqual(rows, ['c.shared', 'c.lonely'])
  // c.shared also qualifies: only ship has it built in.
  assert.equal(matchCount(M, q(), 'thin'), 2)
})

test('a research gap needs at least one scored claim, so an unchecked row is not a gap', () => {
  const rows = matchingRows(M, q({ filter: 'gap' })).map((c) => c.id)
  // c.gap: everyone who looked recorded it absent.
  // c.wire: the only claim is a recorded conflict. Nobody has it built in or by
  // extension and somebody did look, so it belongs here too.
  // Nothing unchecked qualifies, which is the point of the rule.
  assert.deepEqual(rows, ['c.gap', 'c.wire'])
})

test('a row whose only evidence is a conflict counts as nobody having it', () => {
  // Worth knowing because the filter is labelled "nobody has it built in or by
  // extension" and says nothing about conflicts. A conflict is a scored claim
  // and is not built-in support, so the row qualifies. This is the design's
  // settled rule, carried over deliberately.
  const gaps = matchingRows(M, q({ filter: 'gap' })).map((c) => c.id)
  const conflicts = matchingRows(M, q({ filter: 'conflict' })).map((c) => c.id)
  assert.ok(gaps.includes('c.wire') && conflicts.includes('c.wire'),
    'a conflict row appears under both filters, by design')
})

test('the conflict filter finds recorded conflicts', () => {
  assert.deepEqual(matchingRows(M, q({ filter: 'conflict' })).map((c) => c.id), ['c.wire'])
})

test('agreed-on-connect and must-interoperate read the capability, not the claims', () => {
  assert.deepEqual(matchingRows(M, q({ filter: 'connect' })).map((c) => c.id), ['c.wire'])
  assert.deepEqual(matchingRows(M, q({ filter: 'interop' })).map((c) => c.id), ['c.gap'])
})

test('keeping only assessed rows drops rows the selected subjects never scored', () => {
  const onlyQuiet = q({ on: ['quiet'], hasEntry: true })
  assert.equal(matchingRows(M, onlyQuiet).length, 0, 'a subject with no claims leaves no assessed rows')
})

test('out-of-scope does not count as an assessment', () => {
  // ext scores c.gap out of scope only; with hasEntry that row must not survive.
  const onlyExt = q({ on: ['ext'], hasEntry: true })
  assert.ok(!matchingRows(M, onlyExt).some((c) => c.id === 'c.gap'))
})

// --- what a percentage counts ---------------------------------------------

test('production basis counts only shipping, ratified, board-approved or mixed subjects', () => {
  assert.deepEqual(productionIds(M, ALL).sort(), ['ext', 'quiet', 'ship'])
  assert.deepEqual(countedIds(M, q({ basis: 'prod' })).sort(), ['ext', 'quiet', 'ship'])
  assert.deepEqual(countedIds(M, q({ basis: 'all' })), ALL, 'every selected subject counts')
})

test('a lane narrows the rows measured, not the subjects counted', () => {
  assert.deepEqual(measuredCaps(M, q({ lane: 'U2' })).map((c) => c.id), ['c.wire'])
  assert.equal(countedIds(M, q({ lane: 'U2' })).length, 4, 'a lane must not change who is counted')
})

test('the must-agree basis narrows the rows measured, not the subjects counted', () => {
  assert.deepEqual(measuredCaps(M, q({ basis: 'must' })).map((c) => c.id), ['c.gap'])
})

test('the three coverage thresholds only ever widen', () => {
  const c = coverage(M, q())
  assert.ok(c.native <= c.extension, 'adding extensions cannot lower coverage')
  assert.ok(c.extension <= c.partial, 'adding partial cannot lower coverage')
})

test('coverage counts a capability once at least one counted subject reaches it', () => {
  const c = coverage(M, q())
  // Built in: c.shared and c.lonely (ship) -> 2 of 4 = 50%
  assert.equal(c.native, 50)
  // Plus extension: same two rows -> still 50%
  assert.equal(c.extension, 50)
  // Plus partial: c.shared already counted -> still 50%
  assert.equal(c.partial, 50)
  assert.equal(c.measured, 4)
})

test('coverage is zero, not an error, when nothing is selected', () => {
  const c = coverage(M, q({ on: [] }))
  assert.deepEqual([c.native, c.extension, c.partial], [0, 0, 0])
})

// --- the address carries the question --------------------------------------

test('the address carries every analysis choice and no preference', () => {
  const url = shareUrl(
    q({ on: ['ship', 'draft'], filter: 'conflict', hasEntry: true, basis: 'must', lane: 'U2' }),
    'subject', 'ship', null, { cid: 'c.wire', sid: 'ship' }, 4,
  )
  for (const part of ['view=subject', 's=ship,draft', 'of=ship', 'rows=conflict+assessed', 'basis=must', 'lane=U2', 'open=c.wire:ship']) {
    assert.ok(url.includes(part), `address lost ${part}`)
  }
  assert.ok(!/theme|sidebar/.test(url), 'preferences must not travel in the address')
})

test('a full selection shortens to all rather than listing every subject', () => {
  assert.ok(shareUrl(q(), 'compare', null, null, null, 4).includes('s=all'))
})

// --- the published export, not a fixture -----------------------------------

test('the real published export still reports the figures the map claims', async () => {
  const raw = JSON.parse(
    await readFile(new URL('../public/territory.json', import.meta.url), 'utf8'),
  )
  const real = adapt(raw)
  // 2026-10-20: 57 -> 59 subjects, SpatialDDS and the Model Context Protocol (wave 1, owner approval).
  // 2026-10-20: 59 -> 66 subjects, wave 2 (STAC, WebAssembly, Arrival Space, OAuth, Vibe Jam,
  // OMI glTF extensions, JSON-LD; owner approval).
  assert.equal(real.subjects.length, 66)
  // These figures are a deliberate tripwire: they move only when capabilities are
  // added or removed, which is a decision somebody made and should have to record here.
  // 2026-09-18: 162 -> 164, the two approved composability rows.
  // 2026-10-20: 164 -> 168 and 14 -> 15 groups: payment, entitlement and receipt in the new
  // commerce group, and the trust registry in identity (order 063, owner approval 2026-10-19).
  // 2026-10-20: 168 -> 175: agent authoring, whole-world export, and the five rows contributed by
  // the Virtual Dimension Center (wave 2, owner approval).
  assert.equal(real.capabilities.length, 175)
  assert.equal(real.groups.length, 15)
  // The counts block the build writes must agree with what the model derives.
  const claims = Object.values(real.cov).reduce((n, row) => n + Object.keys(row).length, 0)
  assert.equal(claims, (real.counts as Record<string, number>).claims)
  const conflicts = Object.values(real.cov).reduce(
    (n, row) => n + Object.values(row).filter((c) => c[0] === 'c').length, 0)
  assert.equal(conflicts, (real.counts as Record<string, number>).conflicts)
  const unverified = Object.values(real.cov).reduce(
    (n, row) => n + Object.values(row).filter((c) => c[1] === 'u').length, 0)
  assert.equal(unverified, (real.counts as Record<string, number>).unverified)
})

// --- a subject the map mostly does not apply to ----------------------------
//
// Out of scope says the row does not belong to this kind of subject. A reader
// sees only that few rows were reached, and concludes nobody did the work. These
// tests fix the line at which the display has to say otherwise.

const scopeRaw = (levels: string[]) => ({
  groups: [{ id: 'g1', name: 'Group one', plane: 'engine', sort: 1 }],
  capabilities: levels.map((_, i) => cap(`c${i}`)),
  subjects: [{ id: 'sub', name: 'Subject', kind: 'standard', status: 'shipping', summary: '', conflicts: 0, unverified: 0, source_ids: 0, scored: 0 }],
  coverage: {
    sub: Object.fromEntries(
      levels.map((lv, i) => [`c${i}`, [lv, 'verified', '', []]]).filter(([, v]) => (v as string[])[0] !== 'missing'),
    ),
  },
  display_groups: [{ id: 'all', name: 'All', subjects: ['sub'] }],
  counts: { lanes: { U1: 0, U2: 0, U3: 0, U4: 0 } },
})

test('a subject whose rows are mostly out of scope is marked, with the rows counted', () => {
  const m = adapt(scopeRaw(['out-of-scope', 'out-of-scope', 'out-of-scope', 'native']))
  const note = scopeNote(m, 'sub')
  assert.ok(note, 'three of four out of scope is a majority and must be marked')
  assert.equal(note.outOfScope, 3)
  assert.equal(note.applies, 1)
  assert.equal(note.total, 4)
})

test('exactly half out of scope is not a majority and is left alone', () => {
  const m = adapt(scopeRaw(['out-of-scope', 'out-of-scope', 'native', 'none']))
  assert.equal(scopeNote(m, 'sub'), null, 'the rule is more than half, not half')
})

test('never assessed is not out of scope and never triggers the note', () => {
  // Three rows have no claim at all. Only one is out of scope.
  const m = adapt(scopeRaw(['out-of-scope', 'missing', 'missing', 'missing']))
  assert.equal(scopeNote(m, 'sub'), null, 'silence must not be read as a scope boundary')
})

test('a subject nobody assessed gets no note rather than a false one', () => {
  assert.equal(scopeNote(M, 'quiet'), null)
})

test('the note reports Verse as a scope boundary, not as an absence of work', async () => {
  const raw = JSON.parse(
    await readFile(new URL('../public/territory.json', import.meta.url), 'utf8'),
  )
  const real = adapt(raw)

  const before = Object.values(real.cov).reduce((n, row) => n + Object.keys(row).length, 0)
  const note = scopeNote(real, 'verse')
  assert.ok(note, 'Verse sits above the line')
  // 2026-10-20: the four commerce and trust rows are out of scope for a programming language.
  // 2026-10-20: so are the seven wave 2 rows (agent authoring, world export, the five VDC rows).
  assert.equal(note.outOfScope, 125)
  assert.equal(note.applies, 50)
  assert.equal(note.total, 175)
  assert.equal(note.total, note.outOfScope + note.applies)

  // Reading the note must not touch a single claim.
  const after = Object.values(real.cov).reduce((n, row) => n + Object.keys(row).length, 0)
  assert.equal(after, before, 'no claim may change')
  assert.equal(after, (real.counts as Record<string, number>).claims)

  // Unreal Engine is measured mostly on rows that do apply, so it gets nothing.
  assert.equal(scopeNote(real, 'unreal'), null)

  // The rule applies to every subject in the same position, not to Verse alone.
  const marked = real.subjects.filter((s) => scopeNote(real, s.id) !== null)
  // 2026-10-20: 21 -> 29 after waves 0 and 1 answered blank cells of the identity, location and
  // agent standards (mostly out of scope) and added SpatialDDS and the Model Context Protocol.
  // 2026-10-20: 29 -> 38 after wave 2 added formats and protocols where most rows do not apply
  // (STAC, WebAssembly, OAuth, Vibe Jam, OMI glTF extensions, JSON-LD) and answered blank cells.
  // 2026-10-20: 38 -> 39 after wave 3 answered the remaining must-agree cells.
  assert.equal(marked.length, 39)
})
