// A preset or a link can pick rows: `sel=<id>,<id>` names them. Only the picked
// rows show, the other parameters still apply, and the address written back
// carries the pick, so a reload or a copied link restores it. A link may put
// its parameters after `?` or after `#`.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { adapt, matchingRows } from './design-model.ts'
import { PRESETS, addressOf, decode, encode, initialState, queryOf, queryWithoutAddress, reducer } from './app/state.ts'
import type { Preset } from './app/state.ts'

const model = adapt(JSON.parse(await readFile(new URL('../public/territory-index.json', import.meta.url), 'utf8')))
const base = initialState(model)
const total = model.subjects.length
const SIX = ['sense.object-track', 'render.remote', 'net.live-data', 'render.sensory-effect',
  'persist.activity-record', 'input.physiological']
const shown = (s: ReturnType<typeof decode>) => matchingRows(model, queryOf(s)).map((c) => c.id).sort()

test('sel= shows exactly the named rows and survives a round trip', () => {
  const s = decode(`#view=compare&sel=${SIX.join(',')}`, model, base)
  assert.deepEqual(shown(s), [...SIX].sort())
  const again = decode(encode(s, total), model, base)
  assert.deepEqual(shown(again), [...SIX].sort())
  assert.equal(again.view, 'compare')
})

test('sel= drops unknown ids and keeps the compared subjects', () => {
  const s = decode('#view=compare&s=gltf,usd&sel=render.remote,net.live-data,no.such-row', model, base)
  assert.deepEqual(s.sel, ['render.remote', 'net.live-data'])
  assert.deepEqual(shown(s), ['net.live-data', 'render.remote'])
  assert.deepEqual([...decode(encode(s, total), model, base).on].sort(), ['gltf', 'usd'])
})

test('the row filter still applies inside a pick', () => {
  const s = decode(`#view=groups&rows=connect&sel=${SIX.join(',')}`, model, base)
  const ids = shown(s)
  assert.ok(ids.length > 0 && ids.length < SIX.length)
  assert.ok(ids.every((id) => SIX.includes(id) && model.byCapability.get(id)!.bind === 'connect'))
})

test('a link with only unknown ids shows every row', () => {
  assert.equal(shown(decode('#view=groups&sel=no.such-row', model, base)).length, model.capabilities.length)
})

test('clearing the pick shows every row and leaves it out of the address', () => {
  const s = reducer(decode(`#view=groups&sel=${SIX.join(',')}`, model, base), { type: 'clear-picked' })
  assert.equal(shown(s).length, model.capabilities.length)
  assert.doesNotMatch(encode(s, total), /(^|&)sel=/)
})

test('a preset can pick rows, and a link with the same pick selects that preset', () => {
  const p: Preset = { name: 'Test pick', question: 'Test pick question?', scope: 'test', on: [], view: 'compare', filter: 'all', sel: SIX }
  PRESETS.push(p)
  try {
    const applied = reducer(base, { type: 'preset', name: p.name, state: { on: model.subjects.map((x) => x.id), view: 'compare', filter: 'all', lane: null, basis: 'prod', hasEntry: false, sel: SIX } })
    assert.deepEqual(shown(applied), [...SIX].sort())
    assert.equal(decode(`#view=compare&sel=${[...SIX].reverse().join(',')}`, model, base).presetName, 'Test pick')
    assert.equal(decode('#view=compare&sel=render.remote', model, base).presetName, '')
  } finally {
    PRESETS.pop()
  }
})

test('a link may carry the view after ? as well as after #', () => {
  assert.equal(addressOf('', `?view=compare&sel=${SIX.join(',')}`), `?view=compare&sel=${SIX.join(',')}`)
  assert.equal(addressOf('#view=groups', '?view=compare'), '#view=groups')
  const s = decode(addressOf('', `?view=compare&sel=${SIX.join(',')}`), model, base)
  assert.deepEqual(shown(s), [...SIX].sort())
})

test('tracking tags alone do not change the opening view', () => {
  const s = decode('?utm_source=mail&utm_medium=email', model, base)
  assert.equal(s, base)
  assert.equal(queryWithoutAddress('?utm_source=mail&view=compare&sel=a.b'), '?utm_source=mail')
  assert.equal(queryWithoutAddress('?view=compare'), '')
})
