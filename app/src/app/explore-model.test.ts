// Tests for the candidate displays' data rules.
// Run with: node --test src/app/explore-model.test.ts

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { adapt, levelOf, matchingRows } from '../design-model.ts'
import {
  familyOf, families, groupLinks, isStrong, layoutMap, packDots, peers, readCandidateFlag, shortName, stopSummary,
  subjectCounts, writeCandidateFlag,
} from './explore-model.ts'
import { SUBJECT_IMAGES } from './subject-images.ts'

const model = adapt(JSON.parse(readFileSync(new URL('../../../tool/board/territory.json', import.meta.url), 'utf8')))
const all = model.subjects.map((s) => s.id)
const query = (lane: 'U1' | 'U2' | 'U3' | 'U4' | null = null) =>
  ({ on: all, filter: 'all' as const, hasEntry: false, basis: 'prod' as const, lane })

test('the candidate displays appear only with the address flag', () => {
  assert.deepEqual(readCandidateFlag(''), { enabled: false, open: null })
  assert.deepEqual(readCandidateFlag('?x=1'), { enabled: false, open: null })
  assert.deepEqual(readCandidateFlag('?candidates'), { enabled: true, open: null })
  assert.deepEqual(readCandidateFlag('?candidates=map'), { enabled: true, open: 'map' })
  assert.deepEqual(readCandidateFlag('?candidates=lineup'), { enabled: true, open: 'lineup' })
  assert.deepEqual(readCandidateFlag('?candidates=nonsense'), { enabled: true, open: null })
  assert.equal(writeCandidateFlag('?a=1&candidates', 'map'), '?a=1&candidates=map')
  assert.equal(writeCandidateFlag('?candidates=map', null), '?candidates')
  assert.deepEqual(readCandidateFlag(writeCandidateFlag('?candidates', 'lineup')), { enabled: true, open: 'lineup' })
})

test('every subject belongs to exactly one family', () => {
  const fam = familyOf(model)
  assert.equal(fam.size, model.subjects.length)
  const listed = families(model).flatMap((f) => f.subjects.map((s) => s.id))
  assert.equal(new Set(listed).size, listed.length, 'no subject listed twice')
  assert.deepEqual([...listed].sort(), [...all].sort())
})

test('the map places every subject and group once, with no two nodes overlapping', () => {
  const a = layoutMap(model)
  const b = layoutMap(model)
  assert.deepEqual(a.nodes, b.nodes, 'the layout is deterministic')
  assert.equal(a.nodes.filter((n) => n.kind === 'subject').length, model.subjects.length)
  assert.equal(a.nodes.filter((n) => n.kind === 'group').length, model.groups.length)
  for (let i = 0; i < a.nodes.length; i++) {
    for (let j = i + 1; j < a.nodes.length; j++) {
      const p = a.nodes[i]
      const q = a.nodes[j]
      const apart = p.x + p.w <= q.x || q.x + q.w <= p.x || p.y + p.h <= q.y || q.y + q.h <= p.y
      assert.ok(apart, `${p.id} overlaps ${q.id}`)
    }
  }
  for (const n of a.nodes) {
    assert.ok(n.x >= 0 && n.y >= 0 && n.x + n.w <= a.width && n.y + n.h <= a.height, `${n.id} is inside the canvas`)
  }
})

test('a link counts exactly the rows on screen the subject has built in or through an extension', () => {
  const rows = matchingRows(model, query())
  const links = groupLinks(model, ['gltf'], rows)
  for (const l of links) {
    const inGroup = rows.filter((c) => c.g === l.gid)
    const reach = inGroup.filter((c) => ['n', 'x'].includes(levelOf(model.cov.gltf?.[c.id]) ?? '')).length
    assert.equal(l.reach, reach, l.gid)
    assert.equal(l.rows, inGroup.length)
    assert.equal(isStrong(l), reach >= 2 && reach * 2 >= inGroup.length)
  }
  const total = links.reduce((n, l) => n + l.reach, 0)
  const k = subjectCounts(model, 'gltf', rows)
  assert.equal(total, k.n + k.x, 'the links add up to the subject total')
})

test('a lane stop counts only the lane rows, and its leaders are in order', () => {
  const rows = matchingRows(model, query('U2'))
  assert.ok(rows.length > 0)
  assert.ok(rows.every((c) => c.uses.includes('U2')))
  const s = stopSummary(model, all, rows)
  assert.equal(s.rows, rows.length)
  assert.ok(s.builtIn <= s.rows && s.nobody <= s.rows && s.conflictRows <= s.rows)
  assert.equal(s.groups.reduce((n, g) => n + g.rows, 0), rows.length)
  for (let i = 1; i < s.leaders.length; i++) assert.ok(s.leaders[i - 1].reach >= s.leaders[i].reach)
})

test('peers share rows that both have built in or through an extension', () => {
  const rows = matchingRows(model, query())
  const list = peers(model, 'gltf', all, rows)
  assert.ok(list.length > 0 && list.length <= 5)
  assert.ok(!list.some((p) => p.id === 'gltf'))
  const has = (id: string, cid: string) => ['n', 'x'].includes(levelOf(model.cov[id]?.[cid]) ?? '')
  for (const p of list) assert.equal(p.shared, rows.filter((c) => has('gltf', c.id) && has(p.id, c.id)).length)
})

test('packed line-up labels never overlap inside a sub-row', () => {
  const items = Array.from({ length: 30 }, (_, i) => ({ x: (i * 37) % 300, w: 40 + (i % 5) * 20 }))
  const packed = packDots(items, (t) => t.x, (t, x) => [x - 6, x + 8 + t.w])
  const lanes = new Map<number, Array<[number, number]>>()
  for (const p of packed) lanes.set(p.lane, [...(lanes.get(p.lane) ?? []), [p.x - 6, p.x + 8 + p.item.w]])
  for (const spans of lanes.values()) {
    spans.sort((a, b) => a[0] - b[0])
    for (let i = 1; i < spans.length; i++) assert.ok(spans[i - 1][1] + 10 <= spans[i][0])
  }
})

test('names are shortened only when they do not fit', () => {
  assert.equal(shortName('glTF'), 'glTF')
  const long = shortName('MPEG-I Visual Volumetric Video-based Coding (V3C, V-PCC and MIV)', 24)
  assert.ok(long.length <= 24 && long.endsWith('…'))
})

test('every image names a real subject, a free licence and its Commons page', () => {
  const FREE = ['Public domain', 'CC0', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'MIT', 'Apache License 2.0']
  for (const [id, img] of Object.entries(SUBJECT_IMAGES)) {
    assert.ok(model.bySubject.has(id), `${id} is a subject`)
    assert.ok(FREE.includes(img.licence), `${id}: ${img.licence}`)
    assert.match(img.page, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
    assert.match(img.src, /^https:\/\/(thumb|upload)\.wikimedia\.org\//)
    assert.ok(img.author.length > 0)
  }
})
