// The Interop display in the address: view=interop opens it (view=together, its first name, still
// does), a use case travels as `lane`, every part as `parts=all`, one status as `status`. "Widely
// used" is fixed, so an old link's `wide` is ignored. Each step is its own history entry.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { adapt } from './design-model.ts'
import { decode, encode, initialState, reducer, withoutLegacyKeys } from './app/state.ts'
import { historyStep, restoreFromAddress } from './app/history.ts'

const model = adapt(JSON.parse(readFileSync(new URL('../public/territory.json', import.meta.url), 'utf8')))
const total = model.subjects.length
const base = initialState(model)

test('view=interop opens the display at its first screen', () => {
  const s = decode('#view=interop', model, base)
  assert.equal(s.view, 'interop')
  assert.equal(s.lane, null)
  assert.equal(s.wtAll, false)
  assert.equal(s.wtStatus, null)
  assert.equal(encode(s, total), 'view=interop&s=all&rows=all&basis=prod')
})

test('view=together still opens the display, and the address is rewritten to view=interop', () => {
  const s = decode('#view=together&lane=U3&status=own', model, base)
  assert.equal(s.view, 'interop')
  assert.equal(s.lane, 'U3')
  assert.equal(s.wtStatus, 'own')
  assert.equal(withoutLegacyKeys('#view=together&lane=U3&status=own'), '#view=interop&lane=U3&status=own')
  assert.equal(withoutLegacyKeys('?view=together'), '?view=interop')
  // Another key holding the word is left alone.
  assert.equal(withoutLegacyKeys('#view=groups&title=together'), '#view=groups&title=together')
})

test('an old link with wide= opens the same view and the key is dropped', () => {
  const s = decode('#view=interop&lane=U3&status=own&wide=4', model, base)
  assert.equal(s.lane, 'U3')
  assert.equal(s.wtStatus, 'own')
  assert.ok(!('wtWide' in s))
  assert.doesNotMatch(encode(s, total), /wide=/)
  assert.equal(withoutLegacyKeys('#view=together&wide=4&lane=U3'), '#view=interop&lane=U3')
})

test('a use case and one status round-trip through the address', () => {
  const s = decode('#view=interop&lane=U3&status=own', model, base)
  const enc = encode(s, total)
  assert.match(enc, /(^|&)lane=U3(&|$)/)
  assert.match(enc, /(^|&)status=own(&|$)/)
  assert.deepEqual(decode('#' + enc, model, base), s)
})

test('every part travels as parts=all; an open part travels as open', () => {
  const s = decode('#view=interop&parts=all&status=paper&open=identity.credential', model, base)
  assert.equal(s.wtAll, true)
  assert.equal(s.wtStatus, 'paper')
  assert.deepEqual(s.detail, { cid: 'identity.credential', sid: null })
  assert.deepEqual(decode('#' + encode(s, total), model, base), s)
})

test('unknown or out-of-place values are dropped, and other displays ignore these keys', () => {
  assert.equal(decode('#view=interop&status=bogus&lane=U3', model, base).wtStatus, null)
  // A status needs a use case or every part to apply to.
  assert.equal(decode('#view=interop&status=own', model, base).wtStatus, null)
  const groups = decode('#view=groups&parts=all&status=own', model, base)
  assert.equal(groups.wtAll, false)
  assert.equal(groups.wtStatus, null)
  assert.ok(!encode({ ...groups, wtAll: true, wtStatus: 'own' }, total).match(/parts=|status=/))
})

test('switching display, picking a use case and going back reset the inner steps', () => {
  let s = reducer(base, { type: 'view', view: 'interop' })
  s = reducer(s, { type: 'together', patch: { lane: 'U4', wtAll: false, wtStatus: 'own' } })
  assert.equal(s.lane, 'U4')
  assert.equal(s.wtStatus, 'own')
  s = reducer(s, { type: 'detail', detail: { cid: 'logic.agent', sid: null } })
  // Picking another use case closes the open part.
  const other = reducer(s, { type: 'together', patch: { lane: 'U3', wtAll: false, wtStatus: null } })
  assert.equal(other.detail, null)
  // The Lane panel's choice clears the inner steps too.
  assert.equal(reducer(s, { type: 'lane', lane: null }).wtStatus, null)
  // Leaving the display clears them.
  const away = reducer(s, { type: 'view', view: 'groups' })
  assert.equal(away.wtStatus, null)
  assert.equal(away.wtAll, false)
})

test('back and forward: each step is its own entry and restores exactly', () => {
  const first = encode(decode('#view=interop', model, base), total)
  const lane = encode(decode('#view=interop&lane=U1', model, base), total)
  // A change of display always pushes; a quick second step inside the display may merge.
  assert.equal(historyStep({ encoded: 'view=groups&s=all&rows=all&basis=prod', at: 0 }, first, 10), 'push')
  assert.equal(historyStep({ encoded: first, at: 0 }, lane, 5000), 'push')
  const restored = restoreFromAddress('#' + lane, '', model, decode('#' + first, model, base))
  assert.equal(restored.view, 'interop')
  assert.equal(restored.lane, 'U1')
  const backAgain = restoreFromAddress('#' + first, '', model, restored)
  assert.equal(backAgain.lane, null)
})
