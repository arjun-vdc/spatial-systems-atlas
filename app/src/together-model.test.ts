// The Interop display's counting rules, checked against the real published export.
//
// A product uses a standard for a part only when it does the part (built in or through an
// extension) and the export's `via` record names the standard for that claim. The six
// statuses take the first rule that fits; "widely used" is a number of shipping products.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { adapt } from './design-model.ts'
import {
  WIDE_DEFAULT, buildTogether, figures, findings, partFigure, partsOf, statusOf, tally, verdict,
} from './app/together-model.ts'
import type { TogetherStatus } from './app/together-model.ts'

const raw = JSON.parse(readFileSync(new URL('../public/territory.json', import.meta.url), 'utf8'))
const model = adapt(raw)
const t = buildTogether(model)
const idsWith = (k: TogetherStatus, wide = WIDE_DEFAULT) => t.parts.filter((p) => statusOf(p, wide) === k).map((p) => p.cap.id).sort()

test('the counted sets: 27 shipping products, 46 standards and specifications, 4 not shipping, 7 left out', () => {
  assert.equal(t.products.length, 27)
  assert.equal(t.standards.length, 46)
  assert.equal(t.notShipping.length, 4)
  assert.equal(t.leftOut.length, 7)
  assert.equal(t.parts.length, model.capabilities.filter((c) => c.interop === 'must').length)
  assert.equal(t.parts.length, 58)
})

test('a product uses a standard only through via, and only on a claim that does the part', () => {
  const anim = t.byId.get('scene.animation')!
  const gltf = anim.std.find((s) => s.id === 'gltf')!
  // ARCore's via names glTF for animation, but its claim is partial, so it is not counted.
  assert.ok(raw.via.arcore['scene.animation'].includes('gltf'))
  assert.equal(model.cov.arcore['scene.animation'][0], 'p')
  assert.ok(!gltf.named.includes('arcore'))
  assert.deepEqual(gltf.named, ['unity', 'project0', 'babylonjs', 'cesiumjs', 'x3dom', 'xite'])
  // Every named product does the part and has the via entry.
  for (const p of t.parts) for (const s of p.std) for (const id of s.named) {
    assert.ok(p.doers.includes(id), `${id} does not do ${p.cap.id}`)
    assert.ok(raw.via[id]?.[p.cap.id]?.includes(s.id), `${id} has no via entry for ${s.id} on ${p.cap.id}`)
  }
  // Without via nothing is "in use": every part falls to the right of the line.
  const bare = buildTogether({ ...model, via: {} })
  const tl = tally(bare.parts)
  assert.equal(tl.agreed + tl.rivals + tl.some, 0)
})

test('the six statuses over all 58 parts', () => {
  assert.deepEqual(tally(t.parts), { agreed: 5, rivals: 2, some: 15, own: 24, paper: 9, none: 3 })
  assert.deepEqual(idsWith('agreed'), ['capture.splat-format', 'geo.tiles', 'scene.animation', 'scene.geometry', 'scene.texture'])
  assert.deepEqual(idsWith('rivals'), ['input.session', 'scene.container'])
  assert.deepEqual(idsWith('none'), ['identity.key-lifecycle', 'net.world-coupling', 'persist.activity-record'])
})

test('the four figures, for every part and for one use case', () => {
  assert.deepEqual(figures(t.parts), { parts: 58, inUse: 22, shared: 5, notInUse: 36 })
  assert.deepEqual(figures(partsOf(t, model, 'U3')), { parts: 32, inUse: 8, shared: 0, notInUse: 24 })
})

test('each use case splits its parts the same way, and a part keeps one status in every use case', () => {
  const order: TogetherStatus[] = ['agreed', 'rivals', 'some', 'own', 'paper', 'none']
  const by = (lane: Parameters<typeof partsOf>[2]) => { const x = tally(partsOf(t, model, lane)); return order.map((k) => x[k]) }
  assert.deepEqual(t.lanes, ['U1', 'U2', 'U3', 'U4', 'U6', 'U7', 'U10'])
  assert.deepEqual(by('U1'), [5, 1, 11, 8, 5, 0])
  assert.deepEqual(by('U2'), [3, 1, 11, 9, 2, 1])
  assert.deepEqual(by('U3'), [0, 1, 7, 16, 6, 2])
  assert.deepEqual(by('U4'), [0, 0, 1, 13, 5, 2])
  assert.deepEqual(by('U6'), [0, 0, 1, 2, 0, 0])
  assert.deepEqual(by('U7'), [0, 0, 0, 0, 0, 1])
  assert.deepEqual(by('U10'), [0, 0, 1, 2, 0, 0])
  // The bars add up to more than 58 because a part can matter to several use cases.
  assert.equal(t.lanes.reduce((a, lane) => a + partsOf(t, model, lane).length, 0), 117)
})

test('the "widely used" threshold moves parts between statuses', () => {
  // At 4 no further part becomes one shared standard.
  assert.deepEqual(idsWith('agreed', 4), idsWith('agreed', 5))
  // At 3, skeleton and rig definition and avatar body format join it.
  assert.deepEqual(idsWith('agreed', 3), [...idsWith('agreed', 5), 'avatar.body', 'scene.skeleton'].sort())
  assert.deepEqual(tally(t.parts, 3), { agreed: 7, rivals: 2, some: 13, own: 24, paper: 9, none: 3 })
  // At 6 the two rivals each fall to one widely used standard.
  assert.deepEqual(tally(t.parts, 6), { agreed: 5, rivals: 0, some: 17, own: 24, paper: 9, none: 3 })
  assert.deepEqual(idsWith('agreed', 6), ['geo.tiles', 'input.session', 'scene.animation', 'scene.container', 'scene.geometry'])
  // The right-hand side never moves: it does not depend on how many products use a standard.
  for (const w of [2, 3, 4, 5, 6, 9]) assert.equal(tally(t.parts, w).own + tally(t.parts, w).paper + tally(t.parts, w).none, 36)
})

test('the three findings are computed from the data', () => {
  const f = findings(model, t, WIDE_DEFAULT)
  assert.equal(f.travel?.u3.agreed, 0)
  assert.equal(f.travel?.u4.agreed, 0)
  assert.equal(f.travel!.u3.own + f.travel!.u3.paper + f.travel!.u3.none, 24)
  assert.equal(f.travel!.u4.own + f.travel!.u4.paper + f.travel!.u4.none, 20)
  assert.equal(f.travel?.u4n, 21)
  assert.deepEqual(f.commerce, { entitlement: 8, payment: 7, standards: 0 })
  assert.equal(f.paper.n, 9)
  assert.equal(f.paper.example?.cap.id, 'identity.credential')
  assert.equal(f.paper.example?.doers.length, 0)
})

test('a part\'s figure and verdict use its own numbers', () => {
  const geo = t.byId.get('scene.geometry')!
  assert.equal(partFigure(model, t, geo, 5), 'glTF 10 of 27')
  assert.match(verdict(model, t, geo, 5), /^glTF is used for it by 10 of 27 shipping products, the only standard used by 5 or more\.$/)
  const ent = t.byId.get('commerce.entitlement')!
  assert.equal(statusOf(ent), 'own')
  assert.equal(partFigure(model, t, ent, 5), '8 of 27, no standard')
})
