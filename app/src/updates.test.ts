// The history of updates: one entry per date, newest first.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { UPDATES } from './app/updates-log.ts'

test('no two updates share a date', () => {
  const seen = new Set<string>()
  for (const u of UPDATES) {
    assert.ok(!seen.has(u.date), `two entries for ${u.date}; merge a day's changes into one entry`)
    seen.add(u.date)
  }
})

test('updates run newest first', () => {
  const times = UPDATES.map((u) => Date.parse(u.date))
  for (const t of times) assert.ok(Number.isFinite(t))
  for (let i = 1; i < times.length; i++) assert.ok(times[i] < times[i - 1], `${UPDATES[i].date} is out of order`)
})
