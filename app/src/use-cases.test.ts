// Related use cases: need evidence beside the claims, never inside them.
//
// Run: npm test

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { adapt, adaptUseCases, mergeDetail } from './design-model.ts'
import { PRESET_DETAILS_LIMIT, PRESET_TITLE_LIMIT } from './app/custom-preset.ts'
import { PRESETS, presetNamed, presetSubjects } from './app/state.ts'
import {
  basisLabel, coverageFor, linkCount, linksFor, notImported, overlapOf, reasonText, reviewLabel,
} from './app/use-cases.ts'

const rawFull = JSON.parse(readFileSync(new URL('../../tool/board/territory.json', import.meta.url), 'utf8'))
const rawIndex = JSON.parse(readFileSync(new URL('../../tool/board/territory-index.json', import.meta.url), 'utf8'))
const model = adapt(rawFull)
const ACTIVITY = 'persist.activity-record'

test('the export carries the imported training records, each with a public record and the Atlas review apart', () => {
  const { links, cases, source } = model.useCases
  assert.equal(links.length, 12)
  assert.equal(cases.size, 8)
  assert.equal(source?.commit, '1d89b288c28e18b992d528329c3e4366527a748f')
  for (const l of links) {
    assert.ok(model.byCapability.has(l.cap), `${l.id} names an unknown row`)
    assert.equal(l.id, `${l.case}~${l.cap}`)
    assert.ok(['derived', 'proposed'].includes(l.basis))
    assert.equal(l.review.status, 'unreviewed', `${l.id} must start unreviewed`)
    assert.notEqual(l.origin, 'atlas-reader', 'no reader proposal is imported as data')
    assert.ok(l.passage.length > 0 && l.passageFound, `${l.id} quotes no words found on its record`)
    const c = cases.get(l.case)!
    assert.ok(c.url.startsWith('https://') && c.url.endsWith(l.case), `${l.id} does not link its own record`)
  }
  // The one link seen only on the public record page is labelled with that origin.
  const pageOnly = links.filter((l) => l.origin === 'contributor-public-record')
  assert.deepEqual(pageOnly.map((l) => l.id), ['VW-UC-0344~persist.activity-record'])
  assert.equal(pageOnly[0].inPinnedCommit, false)
})

test('use cases never change a cell, a level count or a figure', () => {
  const { use_cases: _, ...withoutUseCases } = rawFull
  const bare = adapt(withoutUseCases)
  assert.deepEqual(bare.cov, model.cov)
  assert.deepEqual(bare.agg, model.agg)
  assert.deepEqual(bare.counts, model.counts)
  assert.deepEqual(bare.subjects, model.subjects)
  assert.equal(bare.useCases.links.length, 0)
})

test('the index carries no use cases; they arrive with the notes, and an export without them reads as none', () => {
  assert.ok(!('use_cases' in rawIndex))
  const first = adapt(rawIndex)
  assert.equal(first.useCases.links.length, 0)
  assert.equal(linkCount(first, ACTIVITY), null, 'still loading, never shown as zero')
  const merged = mergeDetail(first, rawFull)
  assert.equal(linkCount(merged, ACTIVITY), 8)
  assert.deepEqual(adaptUseCases(undefined), { source: null, cases: new Map(), links: [], coverage: {} })
})

test('a row lists every link with its basis and review, in case order, and an unmapped row lists none', () => {
  const ids = linksFor(model, ACTIVITY).map((l) => l.case)
  assert.deepEqual(ids, ['VW-UC-0001', 'VW-UC-0002', 'VW-UC-0228', 'VW-UC-0241', 'VW-UC-0247', 'VW-UC-0280', 'VW-UC-0286', 'VW-UC-0344'])
  assert.equal(linksFor(model, 'identity.credential').length, 0)
  assert.equal(basisLabel('derived'), 'Stated need · derived')
  assert.equal(basisLabel('proposed'), 'Implied need · proposed')
  assert.match(reviewLabel('unreviewed'), /^Unreviewed/)
  const hand = linksFor(model, 'input.hand')[0]
  assert.equal(reasonText(hand), hand.reason, 'a reason that is only the quotation stays whole')
  const lms = linksFor(model, ACTIVITY).find((l) => l.case === 'VW-UC-0247')!
  assert.equal(reasonText(lms), 'The record leaves the simulator for a learning management system.')
})

test('coverage keeps its three counts apart, dated, with overlap and the source copy of Atlas values as history', () => {
  const cov = coverageFor(model, ACTIVITY)!
  assert.deepEqual([cov.useCases, cov.specialisations, cov.deployments], [10, 26, 133])
  assert.equal(cov.interop, 'should')
  assert.equal(model.byCapability.get(ACTIVITY)!.interop, 'must', 'the Atlas value stands')
  assert.deepEqual(notImported(cov, linksFor(model, ACTIVITY)), ['VW-UC-0010', 'VW-UC-0014', 'VW-UC-0277'])
  const overlap = overlapOf(model, linksFor(model, ACTIVITY))!
  assert.deepEqual([overlap.read, overlap.sum, overlap.distinct, overlap.repeated.length], [8, 117, 112, 5])
  assert.ok(overlap.extending.some((x) => x.startsWith('VW-UC-0247 extends VW-UC-0002')))
  assert.equal(overlapOf(model, linksFor(model, 'input.hand')), null, 'one case has no overlap to report')
  assert.equal(coverageFor(model, 'render.raster'), null)
})

test('the training preset fits the preset limits and gives one reason per picked row', () => {
  const p = presetNamed('Training results that travel')!
  assert.ok(p && PRESETS.includes(p))
  assert.ok(p.name.length <= PRESET_TITLE_LIMIT)
  assert.ok((p.details ?? '').length > 0 && (p.details ?? '').length <= PRESET_DETAILS_LIMIT)
  assert.deepEqual(Object.keys(p.reasons ?? {}).sort(), [...(p.sel ?? [])].sort())
  for (const id of p.sel ?? []) assert.ok(model.byCapability.has(id), `unknown row ${id}`)
  assert.ok(presetSubjects(p, model).length <= 8)
  assert.ok(!p.lane, 'a lane would hide the picked rows that are not must rows')
  assert.equal(PRESETS.filter((x) => x.reasons).length, 1, 'the other presets are unchanged')
})
