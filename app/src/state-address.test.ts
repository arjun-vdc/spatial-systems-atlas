import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { adapt } from './design-model.ts'
import { decode, encode, initialState } from './app/state.ts'

test('the supplied Subject fragment restores the same analysis and encodes without a route prefix', () => {
  const model = adapt(JSON.parse(readFileSync(new URL('../../tool/board/territory.json', import.meta.url), 'utf8')))
  const restored = decode('#view=subject&s=gltf,usd,x3d,gltf21,vrm&of=gltf&rows=all&basis=prod', model, initialState(model))
  assert.equal(restored.view, 'subject')
  assert.equal(restored.focus, 'gltf')
  assert.deepEqual([...restored.on].sort(), ['gltf', 'gltf21', 'usd', 'vrm', 'x3d'])
  assert.equal(restored.filter, 'all')
  assert.equal(restored.basis, 'prod')
  assert.ok(encode(restored, model.subjects.length).startsWith('view=subject&'))
  assert.ok(!encode(restored, model.subjects.length).includes('/msf/'))
  const again = decode('#' + encode(restored, model.subjects.length), model, initialState(model))
  assert.deepEqual(again, restored)
})
