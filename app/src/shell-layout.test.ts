import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PHONE_WIDTH, frame, pageLocked, panelMode } from './app/layout.ts'
import { PRESETS, PRESETS_BOX, PRESETS_SHOWN, listedPresets, nextPanels, presetBehindMore } from './app/state.ts'
import type { PanelId } from './app/state.ts'

test('wide and docked layouts hold the page still; the floating (phone) layout scrolls as one', () => {
  assert.equal(pageLocked(false), true, 'docked, at any width')
  assert.equal(pageLocked(true), false, 'floating over the display')
})

test('phones take the sheet whatever is stored; wider screens keep the pin choice', () => {
  assert.equal(PHONE_WIDTH, 600)
  for (const w of [320, 360, 390, 599]) {
    assert.equal(panelMode(w, null, false), 'sheet')
    assert.equal(panelMode(w, true, false), 'sheet', 'a stored docked choice is ignored on a phone')
    assert.equal(panelMode(w, false, true), 'sheet')
  }
  assert.equal(panelMode(600, null, false), 'floating', 'the first width past a phone floats by default')
  assert.equal(panelMode(768, true, false), 'docked', 'pinned on a tablet')
  assert.equal(panelMode(768, false, true), 'floating', 'floated on a tablet')
  assert.equal(panelMode(768, null, true), 'docked', 'the default for the width')
  assert.equal(panelMode(1099, null, false), 'floating')
  assert.equal(panelMode(1100, false, false), 'docked', 'wide screens always dock')
  assert.equal(panelMode(1440, false, false), 'docked')
})

test('held still, the page is one window tall and the column and the display scroll on their own', () => {
  const f = frame(true)
  assert.equal(f.root.height, '100dvh')
  assert.equal(f.root.overflowY, 'hidden', 'the page itself never scrolls')
  assert.equal(f.root.overflowX, 'hidden')
  assert.equal(f.body.minHeight, 0, 'the row may shrink to the space between the header and the footer')
  assert.equal(f.body.alignItems, 'stretch', 'the column runs to the footer')
  assert.equal(f.main.overflowY, 'auto', 'the display scrolls on its own')
  assert.equal(f.main.minHeight, 0)
  // The old column was a window tall and stuck at the top, so it ran the header's height under the footer.
  assert.notEqual(f.side.position, 'sticky')
  assert.ok(!String(f.side.height ?? '').includes('100vh'), 'the column takes the row height, not a window height')
})

test('scrolling as one, the page keeps its own scroll and the column stays in reach', () => {
  const f = frame(false)
  assert.equal(f.root.overflowY, undefined)
  assert.equal(f.root.minHeight, '100dvh')
  assert.equal(f.main.overflowY, undefined, 'one scroll, the page')
  assert.equal(f.side.position, 'sticky')
})

test('presets: three, then More opens a box six cards tall that holds every preset', () => {
  assert.equal(PRESETS_SHOWN, 3)
  assert.equal(PRESETS_BOX, 6)
  assert.deepEqual(listedPresets(false), PRESETS.slice(0, 3))
  assert.deepEqual(listedPresets(true), PRESETS)
  assert.equal(presetBehindMore(PRESETS[2].name), false)
  assert.equal(presetBehindMore(PRESETS[3].name), true, 'the fourth preset opens the box')
  assert.equal(presetBehindMore(PRESETS[PRESETS.length - 1].name), true)
  assert.equal(presetBehindMore(''), false, 'no preset selected')
})

test('the panel column closes and reopens with the sections that were on', () => {
  const on: PanelId[] = ['presets', 'rows', 'lane']
  // Open: a rail button turns its own section on or off, the others stay.
  assert.deepEqual(nextPanels(on, 'rows', 'docked', false), ['presets', 'lane'])
  assert.deepEqual(nextPanels(on, 'subjects', 'floating', false), ['presets', 'subjects', 'rows', 'lane'])
  // Closed: any rail button reopens with everything that was on, and turns nothing off.
  assert.deepEqual(nextPanels(on, 'rows', 'docked', true), on, 'pressing a kept section only reopens')
  assert.deepEqual(nextPanels(on, 'counting', 'docked', true), ['presets', 'rows', 'counting', 'lane'], 'a new section joins the kept ones')
  assert.deepEqual(nextPanels(on, 'presets', 'floating', true), on)
  // The phone sheet is unchanged: one section at a time, whatever a wider screen closed.
  assert.deepEqual(nextPanels(on, 'counting', 'sheet', true), ['counting'])
  assert.deepEqual(nextPanels(['counting'], 'counting', 'sheet', false), [])
})
