import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { adapt, matchingRows } from './design-model.ts'
import type { Action, AppState } from './app/state.ts'
import {
  PANEL_WIDTH, PRESETS, clampPanelWidth, presetBehindMore, defaultPanelsDocked, decode, encode, initialState, parsePanels, presetQuestion,
  presetSubjects, queryOf, reducer,
} from './app/state.ts'

const model = adapt(JSON.parse(readFileSync(new URL('../../tool/board/territory.json', import.meta.url), 'utf8')))

// A preset with a named subset of subjects, so a subject can be added to it.
const SUBSET = PRESETS.findIndex((p) => p.on.length > 1 && !p.mostConflicts)

const withPreset = (index = SUBSET): AppState => {
  const p = PRESETS[index]
  const on = presetSubjects(p, model)
  return reducer(initialState(model), {
    type: 'preset', name: p.name,
    state: { on, view: p.view, filter: p.filter, lane: p.lane ?? null, focus: p.focus ?? on[0], basis: 'prod', hasEntry: false },
  })
}

test('the opening view is the whole map in Groups, with no preset, focus or lane', () => {
  const s = initialState(model)
  assert.equal(s.presetName, '')
  assert.equal(s.view, 'groups')
  assert.equal(s.filter, 'all')
  assert.equal(s.lane, null)
  assert.equal(s.focus, null)
  assert.equal(s.on.length, model.subjects.length)
  assert.equal(presetQuestion(s.presetName), null, 'the opening heading is the generic one')
  assert.ok(!('sidebar' in s), 'the pinned/floating/collapsed preference is gone')
  // The opening view's own address names no preset.
  assert.equal(decode('#' + encode(s, model.subjects.length), model, s).presetName, '')
})

test("the 15 presets, in order, 3 shown and 12 behind More", () => {
  assert.deepEqual(PRESETS.map((p) => p.name), [
    'What has to be agreed', 'Where nobody has built it yet', 'Where the sources disagree',
    'Moving 3D content between tools and worlds', 'Carrying your avatar with you',
    'Travelling between worlds', 'AI agents inside worlds',
    'The open web stack', 'Real places and maps', 'Capturing the real world',
    'Identity, trust and who made what', 'Closed platforms against open formats',
    'Engines against the formats', "The Forum's own projects", 'Platforms OpenSpatials supports',
  ])
  assert.deepEqual(PRESETS.map((p) => presetBehindMore(p.name)), [...Array(3).fill(false), ...Array(12).fill(true)])
  assert.ok(!PRESETS.some((p) => p.name.includes('glTF')), 'glTF beside its neighbours is dropped')
  assert.equal(new Set(PRESETS.map((p) => p.question)).size, PRESETS.length, 'every preset asks its own question')
})

test('every preset names real subjects, keeps Compare to 8 (the platforms preset excepted), shows rows, and its address round-trips', () => {
  const known = new Set(model.subjects.map((s) => s.id))
  const total = model.subjects.length
  for (const [i, p] of PRESETS.entries()) {
    for (const id of p.on) assert.ok(known.has(id), `${p.name}: unknown subject ${id}`)
    const on = presetSubjects(p, model)
    // The platforms preset shows every platform the register names, however many there are.
    if (p.view === 'compare') assert.ok(on.length > 0 && (p.platforms || on.length <= 8), `${p.name}: ${on.length} subjects in Compare`)
    const applied = withPreset(i)
    assert.equal(applied.presetName, p.name)
    assert.equal(presetQuestion(applied.presetName), p.question)
    assert.ok(matchingRows(model, queryOf(applied)).length > 0, `${p.name}: shows no rows`)
    const back = decode('#' + encode(applied, total), model, initialState(model))
    assert.equal(back.presetName, p.name, `${p.name}: its address does not name it`)
    assert.equal(back.view, p.view)
    assert.equal(back.filter, p.filter)
    assert.equal(back.lane, p.lane ?? null)
    assert.deepEqual([...back.on].sort(), [...on].sort())
    assert.equal(encode(decode('#' + encode(back, total), model, back), total), encode(back, total))
  }
})

test('the disagreement preset picks the subjects with the most recorded conflicts', () => {
  const p = PRESETS.find((x) => x.mostConflicts)!
  const on = presetSubjects(p, model)
  const conflicts = (id: string) => model.capabilities.filter((c) => model.cov[id]?.[c.id]?.[0] === 'c').length
  assert.ok(on.length > 0 && on.length <= 8)
  const floor = Math.min(...on.map(conflicts))
  assert.ok(floor > 0)
  for (const s of model.subjects) if (!on.includes(s.id)) assert.ok(conflicts(s.id) <= floor, `${s.id} has more conflicts than a chosen subject`)
})

test('the platforms preset shows every subject with a platform field, in Compare, every row', () => {
  const p = PRESETS.find((x) => x.name === 'Platforms OpenSpatials supports')!
  assert.ok(p.platforms && p.view === 'compare' && p.filter === 'all' && !p.lane && !p.sel)
  const withField = model.subjects.filter((s) => (s.platform ?? []).length > 0).map((s) => s.id)
  assert.ok(withField.length > 0, 'the export carries the platform field')
  assert.deepEqual(presetSubjects(p, model), withField)
  const applied = withPreset(PRESETS.indexOf(p))
  assert.equal(matchingRows(model, queryOf(applied)).length, model.capabilities.length, 'every row')
  // The register ids come through as lists of plain ids; ARCore is two register platforms.
  assert.deepEqual(model.bySubject.get('arcore')!.platform, ['android', 'google-geospatial'])
  assert.deepEqual(model.bySubject.get('threejs')!.platform, ['threejs'])
  assert.equal(model.bySubject.get('gltf')!.platform, undefined)
})

test('the address accepts every lane the data carries and drops an unknown one', () => {
  const base = initialState(model)
  for (const lane of ['U1', 'U4', 'U6', 'U7', 'U10']) {
    assert.equal(decode(`#view=compare&s=all&rows=all&basis=prod&lane=${lane}`, model, base).lane, lane)
  }
  assert.equal(decode('#view=compare&s=all&rows=all&basis=prod&lane=U5', model, base).lane, null)
  assert.equal(decode('#view=compare&s=all&rows=all&basis=prod&lane=U99', model, base).lane, null)
  const s = reducer(base, { type: 'lane', lane: 'U10' })
  assert.equal(decode('#' + encode(s, model.subjects.length), model, base).lane, 'U10')
})

test('a preset is selected until the reader changes subjects, focus, rows, basis or lane', () => {
  const s = withPreset()
  assert.equal(s.presetName, PRESETS[SUBSET].name)
  const other = model.subjects.find((x) => !s.on.includes(x.id))!.id
  const changes: Array<[string, Action]> = [
    ['add a subject', { type: 'toggle-subject', id: other }],
    ['remove a subject', { type: 'toggle-subject', id: s.on[1] }],
    ['replace the subjects', { type: 'set-on', on: [s.on[0]] }],
    ['change the focus', { type: 'focus', id: s.on[1] }],
    ['change the rows filter', { type: 'filter', filter: 'gap' }],
    ['switch on assessed-only', { type: 'has-entry', value: true }],
    ['change the basis', { type: 'basis', basis: 'all' }],
    ['choose a lane', { type: 'lane', lane: 'U2' }],
  ]
  for (const [what, action] of changes) {
    assert.equal(reducer(s, action).presetName, '', `${what} must deselect the preset`)
  }
  // Opening a row's detail or a group is reading, not changing the analysis.
  assert.equal(reducer(s, { type: 'detail', detail: { cid: 'x', sid: null } }).presetName, PRESETS[SUBSET].name)
  assert.equal(reducer(s, { type: 'theme', theme: 'dark' }).presetName, PRESETS[SUBSET].name)
  // Once deselected, the heading is no longer the preset's question.
  assert.equal(presetQuestion(reducer(s, { type: 'filter', filter: 'gap' }).presetName), null)
})

test('an address names a preset only when it is exactly that preset', () => {
  const base = initialState(model)
  const p = PRESETS[SUBSET]
  const exact = `#view=${p.view}&s=${p.on.join(',')}&rows=${p.filter}&basis=prod${p.lane ? `&lane=${p.lane}` : ''}`
  assert.equal(decode(exact, model, base).presetName, p.name)
  assert.equal(decode(exact.replace('basis=prod', 'basis=all'), model, base).presetName, '')
  assert.equal(decode(exact.replace(`rows=${p.filter}`, `rows=${p.filter}+assessed`), model, base).presetName, '')
  assert.equal(decode(exact.replace(`s=${p.on.join(',')}`, `s=${p.on.slice(1).join(',')}`), model, base).presetName, '')
  assert.equal(decode(exact.replace(/&lane=U\d/, '') + '&lane=U4', model, base).presetName,
    p.lane === 'U4' ? p.name : '')
})

test('an old address that carries a removed sidebar mode still loads', () => {
  const plain = decode('#view=compare&s=gltf,usd&rows=all&basis=prod', model, initialState(model))
  for (const mode of ['pinned', 'open', 'collapsed']) {
    const legacy = decode(`#view=compare&s=gltf,usd&rows=all&basis=prod&sidebar=${mode}`, model, initialState(model))
    assert.deepEqual(legacy, plain)
  }
  // Saved state from an older build that still has the field replaces cleanly.
  const old = { ...initialState(model), sidebar: 'pinned', presetEdited: true } as unknown as AppState
  const replaced = reducer(initialState(model), { type: 'replace', state: old })
  assert.equal(reducer(replaced, { type: 'basis', basis: 'all' }).basis, 'all')
})

test('stored rail sections and panel width are read defensively', () => {
  assert.equal(parsePanels(null), null)
  assert.equal(parsePanels('pinned'), null)
  assert.equal(parsePanels('"collapsed"'), null)
  assert.equal(parsePanels('{"sidebar":"open"}'), null)
  assert.deepEqual(parsePanels('[]'), [])
  assert.deepEqual(parsePanels('["lane","presets","bogus"]'), ['presets', 'lane'])
  assert.equal(clampPanelWidth(100), PANEL_WIDTH.min)
  assert.equal(clampPanelWidth(9999), PANEL_WIDTH.max)
  assert.equal(clampPanelWidth(450), 450)
  assert.equal(clampPanelWidth(Number('junk')), PANEL_WIDTH.initial)
})

test('the panel column docks beside the display by default unless the display would keep under 360px', () => {
  assert.equal(defaultPanelsDocked(900, PANEL_WIDTH.initial), true)
  assert.equal(defaultPanelsDocked(768, PANEL_WIDTH.initial), true)
  assert.equal(defaultPanelsDocked(390, PANEL_WIDTH.initial), false, 'a phone floats')
  assert.equal(defaultPanelsDocked(724, 300), true, '724 - 64 rail - 300 column leaves exactly 360')
  assert.equal(defaultPanelsDocked(723, 300), false)
  assert.equal(defaultPanelsDocked(768, PANEL_WIDTH.max), false, 'a wide column on a tablet floats')
})
