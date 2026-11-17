// Platforms are grouped by kind of platform: social worlds, game platforms, and AI-built game
// and world platforms. The grouping comes from the published index, so these tests read it.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { adapt, setState, subcategoryName, subjectKindLine, toggleSet } from './design-model.ts'
import { families } from './app/explore-model.ts'

const raw = JSON.parse(readFileSync(new URL('../public/territory-index.json', import.meta.url), 'utf8'))
const model = adapt(raw)
const platformGroup = model.displayGroups.find((g) => g.id === 'platform')!
const LABELS = ['Social worlds', 'Game platforms', 'AI-built game and world platforms']

test('the platform group carries the three subgroups, in order, with plain labels', () => {
  assert.ok(platformGroup, 'a platform display group exists')
  assert.deepEqual(platformGroup.subgroups?.map((g) => g.id), ['social-world', 'game-platform', 'ai-built-world'])
  assert.deepEqual(platformGroup.subgroups?.map((g) => g.name), LABELS)
})

test('every platform sits in exactly one subgroup, and the flat list follows the subgroups', () => {
  const platforms = model.subjects.filter((s) => s.kind === 'platform').map((s) => s.id).sort()
  const inSubgroups = platformGroup.subgroups!.flatMap((g) => g.subjects)
  assert.deepEqual([...inSubgroups].sort(), platforms)
  assert.equal(new Set(inSubgroups).size, inSubgroups.length, 'no platform is in two subgroups')
  assert.deepEqual(platformGroup.subjects, inSubgroups)
})

test('subcategory reaches only platforms, and matches the subgroup that holds it', () => {
  for (const s of model.subjects) {
    if (s.kind !== 'platform') {
      assert.equal(s.subcategory, undefined, `${s.id} is not a platform`)
      continue
    }
    const holder = platformGroup.subgroups!.find((g) => g.subjects.includes(s.id))!
    assert.equal(s.subcategory, holder.id, s.id)
  }
  for (const g of model.displayGroups) if (g.id !== 'platform') assert.equal(g.subgroups, undefined, g.id)
})

test('the two new platforms are AI-built; named examples sit where their scope puts them', () => {
  const sub = (id: string) => model.bySubject.get(id)?.subcategory
  assert.equal(sub('spawn'), 'ai-built-world')
  assert.equal(sub('project0'), 'ai-built-world')
  assert.equal(sub('vrchat'), 'social-world')
  assert.equal(sub('resonite'), 'social-world')
  assert.equal(sub('roblox'), 'game-platform')
  assert.equal(sub('fortnite'), 'game-platform')
})

test('the subject header prints the subcategory label beside the kind', () => {
  assert.equal(subcategoryName(model, 'spawn'), 'AI-built game and world platforms')
  assert.equal(subjectKindLine(model, model.bySubject.get('vrchat')!), 'platform · Social worlds')
  assert.equal(subjectKindLine(model, model.bySubject.get('roblox')!), 'platform · Game platforms')
  const engine = model.subjects.find((s) => s.kind === 'game-engine')!
  assert.equal(subcategoryName(model, engine.id), null)
  assert.equal(subjectKindLine(model, engine), 'game engine')
})

test('the line-up families carry the platform subgroups as subjects', () => {
  const fam = families(model).find((f) => f.id === 'platform')!
  assert.deepEqual(fam.subgroups?.map((g) => g.name), LABELS)
  assert.deepEqual(fam.subgroups?.flatMap((g) => g.subjects.map((s) => s.id)), platformGroup.subjects)
  assert.ok(families(model).filter((f) => f.id !== 'platform').every((f) => f.subgroups === undefined))
})

test('a subgroup heading switches its own platforms and leaves every other subject alone', () => {
  const ai = platformGroup.subgroups!.find((g) => g.id === 'ai-built-world')!.subjects
  const start = ['gltf', 'vrchat']
  const on = toggleSet(start, ai)
  assert.deepEqual(on, ['gltf', 'vrchat', ...ai])
  assert.deepEqual(setState(on, ai), { n: ai.length, all: true })
  assert.deepEqual(toggleSet(on, ai), start)
  const partly = toggleSet([ai[0]], ai)
  assert.deepEqual(setState(partly, ai).all, true, 'a part-on subgroup switches fully on')
})

test('an older export without subcategories still adapts, with no subgroups and no label', () => {
  const old = structuredClone(raw)
  for (const s of old.subjects) delete s.subcategory
  for (const g of old.display_groups) delete g.subgroups
  const m = adapt(old)
  assert.ok(m.subjects.every((s) => s.subcategory === undefined))
  assert.equal(subjectKindLine(m, m.bySubject.get('vrchat')!), 'platform')
})
