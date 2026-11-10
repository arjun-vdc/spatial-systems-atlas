import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { adapt } from './design-model.ts'
import { BURST_MS, historyStep, restoreFromAddress } from './app/history.ts'
import { encode, initialState } from './app/state.ts'

const model = adapt(JSON.parse(readFileSync(new URL('../../tool/board/territory.json', import.meta.url), 'utf8')))

test('the first write after a load or a back/forward pushes', () => {
  assert.equal(historyStep(null, 'view=compare&s=all', 0), 'push')
})

test('quick changes within one display merge; a slow one or a display change pushes', () => {
  const last = { encoded: 'view=compare&s=a,b', at: 1000 }
  assert.equal(historyStep(last, 'view=compare&s=a', 1000 + BURST_MS - 1), 'replace')
  assert.equal(historyStep(last, 'view=compare&s=a', 1000 + BURST_MS), 'push')
  assert.equal(historyStep(last, 'view=subject&s=a,b', 1001), 'push')
})

test('three quick subject toggles make one entry', () => {
  const steps: string[] = []
  let last = null as { encoded: string; at: number } | null
  for (const [encoded, at] of [['view=groups&s=a,b', 0], ['view=groups&s=a', 200], ['view=groups&s=a,c', 450]] as const) {
    steps.push(historyStep(last, encoded, at))
    last = { encoded, at }
  }
  assert.deepEqual(steps, ['push', 'replace', 'replace'])
})

test('back restores the analysis an entry carries and keeps preferences', () => {
  const current = { ...initialState(model), view: 'subject' as const, theme: 'dark' as const }
  const restored = restoreFromAddress('#view=compare&s=all&rows=interop&basis=prod', '', model, current)
  assert.equal(restored.view, 'compare')
  assert.equal(restored.filter, 'interop')
  assert.equal(restored.theme, 'dark')
  assert.equal(encode(restored, model.subjects.length), encode(restoreFromAddress('#' + encode(restored, model.subjects.length), '', model, current), model.subjects.length))
})

test('an entry with the view after ? restores; one with no address is the opening view', () => {
  const current = { ...initialState(model), view: 'subject' as const, filter: 'gap' as const, theme: 'dark' as const }
  assert.equal(restoreFromAddress('', '?view=compare&s=all', model, current).view, 'compare')
  const opening = restoreFromAddress('', '?utm_source=mail', model, current)
  assert.equal(opening.view, initialState(model).view)
  assert.equal(opening.filter, 'all')
  assert.equal(opening.theme, 'dark')
})
