// The Cite tip's text is the owner's wording, with the build's version and date.
//
// Run: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { citation } from './app/citation.ts'

test('the citation reads exactly as the owner set it', () => {
  assert.equal('Cite as: ' + citation('1.4.19', '2026-11-03'),
    'Cite as: Bilham, G. (2026). Spatial Systems Atlas (Version 1.4.19, last update: 2026-11-03) [Data set and interface]. https://openspatials.com/msf/atlas/. Data and code: https://github.com/openspatials/spatial-systems-atlas.')
})
