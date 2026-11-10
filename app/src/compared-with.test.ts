// The subject display's "Compared with" list collapses to two rows
// collapsedCount decides how many chips show.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { FlowBox } from './app/layout.ts'
import { collapsedCount as collapse } from './app/layout.ts'

const collapsedCount = (...a: Parameters<typeof collapse>) => collapse(...a)?.shown ?? null

const GAP = 8
const CHIP_H = 24
const LABEL_H = 14

/** Lays out a label and chips of the given widths the way a wrapping, centred flex row does. */
function flow(widths: number[], width: number, labelWidth = 100): FlowBox[] {
  const items = [labelWidth, ...widths]
  const boxes: FlowBox[] = []
  let x = 0
  let rowTop = 0
  items.forEach((w, i) => {
    if (x > 0 && x + w > width) { x = 0; rowTop += CHIP_H + GAP }
    const h = i === 0 ? LABEL_H : CHIP_H
    const top = rowTop + (CHIP_H - h) / 2
    boxes.push({ top, bottom: top + h, right: x + w })
    x += w + GAP
  })
  return boxes
}

test('a list that fits on two rows has no toggle', () => {
  assert.equal(collapsedCount(flow([100, 100], 600), 70, GAP, 600), null, 'one row')
  // label + 4 chips of 100 = 100 + 4*108 = 532 on row one; 3 more on row two
  assert.equal(collapsedCount(flow(Array(7).fill(100), 600), 70, GAP, 600), null, 'exactly two rows')
  assert.equal(collapsedCount([], 70, GAP, 600), null, 'nothing at all')
})

test('a long list shows only the chips on its first two rows, with room for the toggle', () => {
  const widths = Array(20).fill(100)
  // Row one: label + 4 chips (ends at 532). Row two: 5 chips (ends at 532). A 70px toggle fits after them (532+8+70=610 > 600? no).
  const n = collapsedCount(flow(widths, 600), 70, GAP, 600)
  // 532 + 8 + 70 = 610 > 600, so one chip leaves row two.
  assert.equal(n, 8)
  const roomy = collapsedCount(flow(widths, 650), 70, GAP, 650)
  // At 650: row one label + 5 chips (ends 640); row two 6 chips (ends 640); 640+78 > 650 → 5 on row two.
  assert.equal(roomy, 10)
})

test('the toggle never pushes a third row: chips drop from the end until it fits', () => {
  const widths = [100, 100, 100, 100, 480, 300, 300]
  // Row one: label + 4 chips. Row two: the 480 chip alone (a 300 chip will not fit beside it at 600).
  const boxes = flow(widths, 600)
  const n = collapsedCount(boxes, 70, GAP, 600)
  assert.equal(n, 5, '480 + 8 + 70 = 558 fits beside the toggle')
  assert.deepEqual(collapse(boxes, 120, GAP, 600), { shown: 5, squeeze: true },
    'a wider toggle cannot sit beside the only chip on row two, so that chip is narrowed rather than dropped')
})

test('narrow (phone) columns: a long chip alone on row two is kept and narrowed, never dropped', () => {
  // A 260px column: label 100, then a 200px chip will not fit beside it.
  const boxes = flow([200, 200, 200, 200], 260)
  // Row one: label. Row two: first chip (ends 200); 200+8+70 = 278 > 260: it stays, narrowed, beside the button.
  assert.deepEqual(collapse(boxes, 70, GAP, 260), { shown: 1, squeeze: true })
  // Two chips share row two and the button needs room: the second drops, the first is not narrowed.
  const two = flow([100, 100, 100, 100, 100], 260, 150)
  // Row one: label 150 + chip 100 (ends 258). Row two: chips 2 and 3 (ends 208); 208+78 > 260 → 2 shown.
  assert.deepEqual(collapse(two, 70, GAP, 260), { shown: 2, squeeze: false })
})

test('rows are told apart by height, not by equal tops, since the label is centred on the chips', () => {
  const boxes = flow(Array(12).fill(90), 500)
  assert.notEqual(boxes[0].top, boxes[1].top, 'label and first chip have different tops on the same row')
  const n = collapsedCount(boxes, 70, GAP, 500)
  // Row one: label(100) + 4 chips (ends 492). Row two: 5 chips (ends 482); 482+78 > 500 → 4.
  assert.equal(n, 8)
})
