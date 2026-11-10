// The subject display's four figures, against the published index, and the
// retired figure filters: the figures are plain
// figures, and an old link's `only=` is ignored and dropped from the address.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import type { SubjectOnly } from './design-model.ts'
import { adapt, levelOf, NO_SUBJECT_ONLY, subjectRows } from './design-model.ts'
import { decode, encode, initialState, queryWithoutAddress, reducer, withoutLegacyKeys } from './app/state.ts'

const model = adapt(JSON.parse(readFileSync(new URL('../public/territory-index.json', import.meta.url), 'utf8')))
const total = model.subjects.length
const rows = model.capabilities
const only = (o: Partial<SubjectOnly>): SubjectOnly => ({ ...NO_SUBJECT_ONLY, ...o })
const count = (id: string, o: Partial<SubjectOnly>) => subjectRows(model, id, only(o), rows).length

// A subject with something under every figure, so no filter is tested against an empty set.
const busy = model.subjects.find((s) => s.conflicts > 0 && s.never > 0 && s.native > 0)!

test('with no filter on, every row passes', () => {
  assert.equal(count(busy.id, {}), rows.length)
})

test('each figure counts the rows its definition names', () => {
  for (const s of model.subjects) {
    assert.equal(count(s.id, { reach: true }), s.reach, `${s.id} reach`)
    assert.equal(count(s.id, { native: true }), s.native, `${s.id} built in`)
    assert.equal(count(s.id, { assessed: 'assessed' }), rows.length - s.never, `${s.id} assessed`)
    assert.equal(count(s.id, { assessed: 'unassessed' }), s.never, `${s.id} not assessed`)
    assert.equal(count(s.id, { conflicts: true }), s.conflicts, `${s.id} conflicts`)
  }
})

test('the test subject has rows under every figure', () => {
  assert.ok(busy, 'a subject with conflicts, unassessed rows and built-in rows exists')
  assert.ok(busy.reach > busy.native)
})

test('filters combine: a row must pass every active one', () => {
  const both = subjectRows(model, busy.id, only({ reach: true, assessed: 'assessed' }), rows)
  assert.equal(both.length, busy.reach)
  const none = subjectRows(model, busy.id, only({ native: true, conflicts: true }), rows)
  assert.equal(none.length, 0)
  const unassessedReach = subjectRows(model, busy.id, only({ reach: true, assessed: 'unassessed' }), rows)
  assert.equal(unassessedReach.length, 0)
  const lane = rows.filter((c) => c.interop === 'must')
  const mustNative = subjectRows(model, busy.id, only({ native: true }), lane)
  assert.ok(mustNative.every((c) => c.interop === 'must' && levelOf(model.cov[busy.id]?.[c.id]) === 'n'))
})

test('a legacy only= link opens with no figure filter and keeps every other row filter', () => {
  const plain = `#view=subject&s=all&of=${busy.id}&rows=gap+assessed&basis=all&lane=U1`
  for (const words of ['native', 'reach,unassessed,conflicts', 'assessed', 'bogus']) {
    const legacy = decode(`${plain}&only=${words}`, model, initialState(model))
    assert.equal('only' in legacy, false, 'the state has no figure filter at all')
    assert.deepEqual(legacy, decode(plain, model, initialState(model)), `only=${words} changes nothing`)
    assert.equal(legacy.view, 'subject')
    assert.equal(legacy.focus, busy.id)
    assert.equal(legacy.filter, 'gap', 'the row filter is kept')
    assert.equal(legacy.hasEntry, true, 'the assessed-only switch is kept')
    assert.equal(legacy.basis, 'all')
    assert.equal(legacy.lane, 'U1')
    assert.doesNotMatch(encode(legacy, total), /only=/, 'the app never writes it back')
  }
})

test('the app never writes a figure filter into the address', () => {
  let s = reducer(initialState(model), { type: 'focus', id: busy.id })
  s = reducer(s, { type: 'filter', filter: 'conflict' })
  s = reducer(s, { type: 'has-entry', value: true })
  assert.doesNotMatch(encode(s, total), /only=/)
})

test('a retired key is dropped from the address, every other byte kept', () => {
  assert.equal(withoutLegacyKeys('#view=subject&s=usd,gltf&of=usd&rows=all&basis=prod&only=native&x=1'),
    '#view=subject&s=usd,gltf&of=usd&rows=all&basis=prod&x=1', 'subject order and unknown fields survive')
  assert.equal(withoutLegacyKeys('#only=reach&view=groups'), '#view=groups')
  assert.equal(withoutLegacyKeys('?only=reach'), '')
  assert.equal(withoutLegacyKeys('?utm_source=mail&only=reach'), '?utm_source=mail')
  assert.equal(withoutLegacyKeys('#view=groups&s=all'), '#view=groups&s=all', 'an address without it is untouched')
  assert.equal(withoutLegacyKeys(''), '')
  assert.equal(withoutLegacyKeys('#onlyish=1&lonely=2'), '#onlyish=1&lonely=2', 'only the exact key is retired')
  assert.equal(queryWithoutAddress('?only=native&utm_source=mail'), '?utm_source=mail', 'a ? link loses it too')
})
