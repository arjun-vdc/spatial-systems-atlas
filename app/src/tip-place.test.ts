import assert from 'node:assert/strict'
import { test } from 'node:test'
import { tipPlace } from './app/tip-place.ts'

const viewport = { width: 1440, height: 900 }

test('below, a tip lines up with the button\'s right edge and stays inside the main column', () => {
  const button = { left: 1000, right: 1030, top: 40, bottom: 70 }
  assert.deepEqual(tipPlace({ button, area: { left: 300, right: 1440 }, viewport, side: 'below', width: 340 }),
    { left: 690, width: 340, top: 76 })
  // Near the column's left edge it moves right, clear of the tool rail.
  const near = { left: 310, right: 340, top: 40, bottom: 70 }
  assert.equal(tipPlace({ button: near, area: { left: 300, right: 1440 }, viewport, side: 'below', width: 340 }).left, 316)
  // A column narrower than the tip narrows the tip.
  assert.equal(tipPlace({ button: near, area: { left: 0, right: 390 }, viewport: { width: 390, height: 844 }, side: 'below', width: 400 }).width, 358)
})

test('above, a tip is centred over the button, inside the window, and its bottom sits over the button', () => {
  const button = { left: 700, right: 740, top: 880, bottom: 896 }
  assert.deepEqual(tipPlace({ button, viewport, side: 'above', width: 300 }), { left: 570, width: 300, bottom: 26 })
  // The main column does not bound a footer tip.
  assert.equal(tipPlace({ button: { ...button, left: 10, right: 40 }, area: { left: 300, right: 1440 }, viewport, side: 'above', width: 300 }).left, 16)
  assert.equal(tipPlace({ button: { ...button, left: 1420, right: 1436 }, viewport, side: 'above', width: 300 }).left, 1124)
})

test('beside, a tip opens to the left of the button, level with its top', () => {
  const button = { left: 1380, right: 1398, top: 220, bottom: 238 }
  assert.deepEqual(tipPlace({ button, area: { left: 300, right: 1440 }, viewport, side: 'beside', width: 220 }),
    { left: 1154, width: 220, top: 220 })
})
