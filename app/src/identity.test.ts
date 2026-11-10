import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { test } from 'node:test'
import { THEMES } from './app/marks.ts'
import { checkPalette, contrast, identityCss, readIdentity } from './identity/identity.ts'
import { IDENTITIES, IDENTITY_IDS } from './identity/tokens.ts'

const css = readFileSync(new URL('./identity/identity.css', import.meta.url), 'utf8')
const publicDir = new URL('../public/', import.meta.url)

test('the address picks a candidate only with a known ?identity value', () => {
  assert.equal(readIdentity('?identity=a'), 'a')
  assert.equal(readIdentity('?identity=C'), 'c')
  assert.equal(readIdentity('?x=1&identity=b'), 'b')
  assert.equal(readIdentity(''), null)
  assert.equal(readIdentity('?identity='), null)
  assert.equal(readIdentity('?identity=d'), null)
})

test('every candidate replaces every token of today\'s palette, in light and dark', () => {
  for (const id of IDENTITY_IDS) {
    for (const theme of ['light', 'dark'] as const) {
      const missing = Object.keys(THEMES[theme]).filter((k) => !(k in IDENTITIES[id][theme]))
      assert.deepEqual(missing, [], `${id} ${theme} leaves today's value for ${missing.join(', ')}`)
    }
  }
})

test('every text pairing passes WCAG AA, and every mark edge passes 3:1', () => {
  for (const id of IDENTITY_IDS) {
    for (const theme of ['light', 'dark'] as const) {
      const failed = checkPalette(IDENTITIES[id][theme]).filter((c) => !c.pass)
      assert.deepEqual(failed.map((c) => `${c.fg} on ${c.bg} = ${c.ratio.toFixed(2)}`), [], `${id} ${theme}`)
    }
  }
})

test('the contrast formula matches the WCAG reference values', () => {
  assert.equal(contrast('#000000', '#FFFFFF').toFixed(2), '21.00')
  assert.equal(contrast('#777777', '#FFFFFF').toFixed(2), '4.48')
})

test('the candidate CSS outranks the inline palette and is scoped to its own identity', () => {
  for (const id of IDENTITY_IDS) {
    const text = identityCss(id)
    assert.match(text, new RegExp(`:root\\[data-identity='${id}'\\]\\[data-theme='light'\\]`))
    assert.match(text, new RegExp(`:root\\[data-identity='${id}'\\]\\[data-theme='dark'\\]`))
    const declarations = text.match(/--[\w-]+: [^;]+;/g) ?? []
    assert.ok(declarations.length > 40)
    assert.ok(declarations.every((d) => d.endsWith('!important;')), 'every token is !important')
  }
  // The detail rules never apply without a candidate in the address.
  const rules = css.replace(/@font-face\s*{[^}]*}/g, '').match(/^[^@/\s][^{]*{/gm) ?? []
  assert.ok(rules.length > 0)
  for (const r of rules) assert.match(r, /:root\[data-identity\]/, r)
})

test('every face a candidate names is self-hosted with its licence beside it', () => {
  const faces = [...css.matchAll(/font-family: '([^']+)';\s*src: url\('\/fonts\/([^']+)'\)/g)]
  const declared = new Set(faces.map((m) => m[1]))
  for (const id of IDENTITY_IDS) {
    for (const token of ['--fl', '--fb', '--fm', '--labelFont']) {
      const family = IDENTITIES[id].light[token].match(/^'([^']+)'/)?.[1]
      assert.ok(family && declared.has(family), `${id} ${token} names ${family}, which has no @font-face`)
    }
  }
  for (const [, , file] of faces) {
    const url = new URL(`fonts/${file}`, publicDir)
    assert.ok(existsSync(url), `missing ${file}`)
    assert.ok(existsSync(new URL('OFL.txt', new URL(`${dirname(`fonts/${file}`)}/`, publicDir))), `no licence for ${file}`)
  }
  assert.doesNotMatch(css, /https?:\/\//, 'no external font request')
})
