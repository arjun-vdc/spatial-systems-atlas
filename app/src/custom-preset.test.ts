import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { adapt, matchingRows } from './design-model.ts'
import type { Model } from './design-model.ts'
import type { Action } from './app/state.ts'
import { assessedSubjects, normalizeCustomPreset } from './app/custom-preset.ts'
import { decode, encode, initialState, PRESETS, queryOf, queryWithoutAddress, reducer } from './app/state.ts'
import { restoreFromAddress } from './app/history.ts'

const model = adapt(JSON.parse(readFileSync(new URL('../../tool/board/territory.json', import.meta.url), 'utf8')))
const sel = ['sense.object-track', 'render.remote', 'net.live-data', 'persist.activity-record', 'input.physiological', 'render.sensory-effect']
const title = 'Sensing, rendering and live-world data'
const details = 'How do spatial systems support these six capabilities?'
const custom = () => reducer({ ...initialState(model), view: 'compare', sel }, {
  type: 'custom-preset', title, details, on: assessedSubjects(model, sel),
})

test('custom preset restores metadata, six capabilities and the exact assessed subject selection in a fresh state', () => {
  const state = custom()
  // 40 -> 41 on 2026-11-14: Project 0 is assessed on three of the six rows.
  assert.equal(state.on.length, 41)
  const restored = decode('#' + encode(state, model.subjects.length), model, initialState(model))
  assert.deepEqual(restored, state)
  assert.deepEqual(restored.customPreset, { title, details })
  assert.equal(matchingRows(model, queryOf(restored)).length, 6)
  assert.equal(restored.presetName, '')
})

test('assessed selection retains absence and unverified claims, excludes missing and out-of-scope, and handles all rows', () => {
  const fixture: Model = { ...model, subjects: model.subjects.slice(0, 5), cov: {
    [model.subjects[0].id]: { a: 'zu' },
    [model.subjects[1].id]: { a: 'ou' },
    [model.subjects[2].id]: {},
    [model.subjects[3].id]: { a: 'cu' },
    [model.subjects[4].id]: { a: 'nv' },
  } }
  assert.deepEqual(assessedSubjects(fixture, ['a']), [0, 3, 4].map((i) => fixture.subjects[i].id))
  assert.deepEqual(assessedSubjects(fixture, ['unknown']), [])
  assert.ok(assessedSubjects(model, []).length > 0)
})

test('form and address normalize whitespace/control characters, reject blank titles and bound untrusted metadata', () => {
  assert.deepEqual(normalizeCustomPreset('  e\u0301\n title\u202e ', ' a\t b '), { title: 'é title', details: 'a b' })
  assert.equal(normalizeCustomPreset({}, ['not text']), null)
  assert.equal(normalizeCustomPreset('\u0000 \n', 'details alone'), null)
  const long = decode('#view=compare&title=' + 'a'.repeat(1000) + '&details=' + 'b'.repeat(1000), model, initialState(model))
  assert.equal(long.customPreset?.title.length, 80)
  assert.equal(long.customPreset?.details.length, 160)
  assert.equal(decode('#details=orphan', model, custom()).customPreset, null)
  assert.doesNotThrow(() => decode('#title=%E0%A4%A', model, initialState(model)))
  const untrusted = '<img src=x onerror=alert(1)> & # = +'
  const state = reducer(initialState(model), { type: 'custom-preset', title: untrusted, details: untrusted })
  const encoded = encode(state, model.subjects.length)
  assert.ok(!encoded.includes('<img'))
  assert.deepEqual(decode('#' + encoded, model, initialState(model)).customPreset, { title: untrusted, details: untrusted })
  assert.equal(queryWithoutAddress('?title=a&details=b&utm_source=mail'), '?utm_source=mail')
})

test('analysis edits clear custom identity; preferences and detail inspection preserve it; back restores it', () => {
  const state = custom()
  for (const action of [
    { type: 'set-on', on: [] }, { type: 'filter', filter: 'gap' }, { type: 'basis', basis: 'all' },
    { type: 'clear-picked' }, { type: 'view', view: 'groups' },
  ] as Action[]) assert.equal(reducer(state, action).customPreset, null)
  assert.deepEqual(reducer(state, { type: 'theme', theme: 'dark' }).customPreset, state.customPreset)
  assert.deepEqual(reducer(state, { type: 'detail', detail: { cid: sel[0], sid: null } }).customPreset, state.customPreset)
  const edited = reducer(state, { type: 'set-on', on: [] })
  assert.deepEqual(restoreFromAddress('#' + encode(state, model.subjects.length), '', model, edited).customPreset, state.customPreset)
  assert.equal(restoreFromAddress('', '', model, state).customPreset, null)
  assert.equal(decode('#view=compare&s=gltf,usd', model, state).customPreset, null)
  assert.equal(reducer(state, { type: 'preset', name: PRESETS[0].name, state: {} }).customPreset, null)
})
