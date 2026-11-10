// An export of the current selection holds the picked rows and no others, and a
// lane holds its must rows only, so the Lane panel's number always equals the rows
// the Atlas shows for that lane, under every row filter.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { adapt, laneIds, matchCount, matchingRows } from './design-model.ts'
import type { LaneId, Query, RowFilter } from './design-model.ts'
import { exportOptions } from './app/exports.ts'

const model = adapt(JSON.parse(await readFile(new URL('../public/territory-index.json', import.meta.url), 'utf8')))
const on = model.subjects.map((s) => s.id)
const q = (over: Partial<Query> = {}): Query => ({ on, filter: 'all', hasEntry: false, basis: 'prod', lane: null, ...over })
const PICK = ['render.remote', 'net.live-data', 'input.physiological']

test('the selection export holds exactly the picked rows', () => {
  const selection = exportOptions(model, q({ sel: PICK }))[0]
  assert.equal(selection.scope.rows, on.length * PICK.length)
  const everything = exportOptions(model, q({ sel: PICK }))[1]
  assert.equal(everything.scope.rows, on.length * model.capabilities.length, 'the whole export ignores the pick')
})

// Every lane the data carries, not a fixed four.
const LANES: LaneId[] = laneIds(model)
const FILTERS: RowFilter[] = ['all', 'overlap', 'thin', 'gap', 'conflict', 'connect', 'interop']

test('the model carries every lane the build counts, in number order, each with a label', () => {
  const built = Object.keys((model.counts as any).lanes)
  assert.deepEqual(LANES, [...built].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))))
  assert.deepEqual(LANES, ['U1', 'U2', 'U3', 'U4', 'U6', 'U7', 'U10'])
  assert.deepEqual(LANES.map((l) => model.lanes[l].label), [
    'Content portability', 'Avatar portability', 'World-to-world travel', 'Agent participation',
    'Same place, same thing', 'Training results that travel', 'Shared presence',
  ])
  for (const l of LANES) assert.equal(model.lanes[l].n, (model.counts as any).lanes[l], l)
})

test('each lane holds its must rows, as the build counts them', () => {
  for (const lane of LANES) {
    assert.equal(matchingRows(model, q({ lane })).length, (model.counts as any).lanes[lane], lane)
  }
})

test('the Lane panel number equals the rows shown, for every lane and row filter', () => {
  for (const lane of LANES) {
    for (const filter of FILTERS) {
      const shown = matchingRows(model, q({ lane, filter })).length
      assert.equal(matchCount(model, q({ lane }), filter), shown, `${lane} ${filter}`)
      assert.ok(matchingRows(model, q({ lane, filter })).every((c) => c.interop === 'must' && c.uses.includes(lane)))
    }
  }
})
